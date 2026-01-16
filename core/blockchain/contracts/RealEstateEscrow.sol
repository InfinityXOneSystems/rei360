// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RealEstateEscrow
 * @dev Escrow contract for real estate transactions with Stripe payment integration
 * @notice Handles deposits, releases, and refunds for property transactions
 */
contract RealEstateEscrow is ReentrancyGuard, Ownable {

    struct Transaction {
        address buyer;
        address seller;
        uint256 amount;
        string propertyId;
        string stripePaymentId;
        uint256 createdAt;
        uint256 releaseDate;
        TransactionState state;
        bool sellerApproved;
        bool buyerApproved;
    }

    enum TransactionState {
        Pending,
        Funded,
        InProgress,
        ReadyForRelease,
        Completed,
        Disputed,
        Refunded,
        Cancelled
    }

    // Transaction tracking
    mapping(bytes32 => Transaction) public transactions;
    mapping(address => bytes32[]) public userTransactions;

    // Fee structure (basis points, 100 = 1%)
    uint256 public platformFeeBps = 200; // 2%
    uint256 public constant MAX_FEE_BPS = 500; // 5% maximum

    // Events
    event TransactionCreated(
        bytes32 indexed transactionId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string propertyId
    );

    event FundsDeposited(
        bytes32 indexed transactionId,
        uint256 amount,
        string stripePaymentId
    );

    event FundsReleased(
        bytes32 indexed transactionId,
        address indexed seller,
        uint256 amount,
        uint256 fee
    );

    event TransactionRefunded(
        bytes32 indexed transactionId,
        address indexed buyer,
        uint256 amount
    );

    event DisputeRaised(
        bytes32 indexed transactionId,
        address indexed initiator
    );

    event ApprovalReceived(
        bytes32 indexed transactionId,
        address indexed approver,
        bool isSeller
    );

    /**
     * @dev Create a new escrow transaction
     * @param _buyer Address of the buyer
     * @param _seller Address of the seller
     * @param _amount Transaction amount in wei
     * @param _propertyId Unique property identifier
     * @param _releaseDate Unix timestamp when funds can be released
     */
    function createTransaction(
        address _buyer,
        address _seller,
        uint256 _amount,
        string memory _propertyId,
        uint256 _releaseDate
    ) external onlyOwner returns (bytes32) {
        require(_buyer != address(0), "Invalid buyer address");
        require(_seller != address(0), "Invalid seller address");
        require(_amount > 0, "Amount must be positive");
        require(_releaseDate > block.timestamp, "Release date must be in future");

        bytes32 transactionId = keccak256(
            abi.encodePacked(_buyer, _seller, _amount, _propertyId, block.timestamp)
        );

        require(transactions[transactionId].buyer == address(0), "Transaction exists");

        transactions[transactionId] = Transaction({
            buyer: _buyer,
            seller: _seller,
            amount: _amount,
            propertyId: _propertyId,
            stripePaymentId: "",
            createdAt: block.timestamp,
            releaseDate: _releaseDate,
            state: TransactionState.Pending,
            sellerApproved: false,
            buyerApproved: false
        });

        userTransactions[_buyer].push(transactionId);
        userTransactions[_seller].push(transactionId);

        emit TransactionCreated(transactionId, _buyer, _seller, _amount, _propertyId);

        return transactionId;
    }

    /**
     * @dev Deposit funds into escrow (called after Stripe payment)
     * @param _transactionId Transaction identifier
     * @param _stripePaymentId Stripe payment intent ID
     */
    function depositFunds(
        bytes32 _transactionId,
        string memory _stripePaymentId
    ) external payable nonReentrant {
        Transaction storage txn = transactions[_transactionId];
        require(txn.state == TransactionState.Pending, "Invalid state");
        require(msg.value == txn.amount, "Incorrect amount");
        require(
            msg.sender == txn.buyer || msg.sender == owner(),
            "Only buyer or owner"
        );

        txn.state = TransactionState.Funded;
        txn.stripePaymentId = _stripePaymentId;

        emit FundsDeposited(_transactionId, msg.value, _stripePaymentId);
    }

    /**
     * @dev Approve transaction for release
     * @param _transactionId Transaction identifier
     */
    function approveRelease(bytes32 _transactionId) external {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.state == TransactionState.Funded ||
            txn.state == TransactionState.InProgress,
            "Invalid state"
        );
        require(
            msg.sender == txn.buyer || msg.sender == txn.seller,
            "Not authorized"
        );

        if (msg.sender == txn.seller) {
            txn.sellerApproved = true;
            emit ApprovalReceived(_transactionId, msg.sender, true);
        } else {
            txn.buyerApproved = true;
            emit ApprovalReceived(_transactionId, msg.sender, false);
        }

        // If both approved, mark ready for release
        if (txn.sellerApproved && txn.buyerApproved) {
            txn.state = TransactionState.ReadyForRelease;
        } else if (txn.state == TransactionState.Funded) {
            txn.state = TransactionState.InProgress;
        }
    }

    /**
     * @dev Release funds to seller
     * @param _transactionId Transaction identifier
     */
    function releaseFunds(bytes32 _transactionId) external nonReentrant {
        Transaction storage txn = transactions[_transactionId];
        require(txn.state == TransactionState.ReadyForRelease, "Not ready");
        require(block.timestamp >= txn.releaseDate, "Release date not reached");
        require(
            msg.sender == owner() || msg.sender == txn.buyer,
            "Not authorized"
        );

        uint256 fee = (txn.amount * platformFeeBps) / 10000;
        uint256 sellerAmount = txn.amount - fee;

        txn.state = TransactionState.Completed;

        // Transfer to seller
        (bool successSeller, ) = txn.seller.call{value: sellerAmount}("");
        require(successSeller, "Transfer to seller failed");

        // Transfer fee to platform
        if (fee > 0) {
            (bool successFee, ) = owner().call{value: fee}("");
            require(successFee, "Fee transfer failed");
        }

        emit FundsReleased(_transactionId, txn.seller, sellerAmount, fee);
    }

    /**
     * @dev Refund funds to buyer
     * @param _transactionId Transaction identifier
     */
    function refundTransaction(bytes32 _transactionId) external nonReentrant {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.state == TransactionState.Funded ||
            txn.state == TransactionState.InProgress ||
            txn.state == TransactionState.Disputed,
            "Invalid state"
        );
        require(msg.sender == owner(), "Only owner can refund");

        txn.state = TransactionState.Refunded;

        (bool success, ) = txn.buyer.call{value: txn.amount}("");
        require(success, "Refund failed");

        emit TransactionRefunded(_transactionId, txn.buyer, txn.amount);
    }

    /**
     * @dev Raise a dispute
     * @param _transactionId Transaction identifier
     */
    function raiseDispute(bytes32 _transactionId) external {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.state == TransactionState.Funded ||
            txn.state == TransactionState.InProgress,
            "Invalid state"
        );
        require(
            msg.sender == txn.buyer || msg.sender == txn.seller,
            "Not authorized"
        );

        txn.state = TransactionState.Disputed;

        emit DisputeRaised(_transactionId, msg.sender);
    }

    /**
     * @dev Update platform fee (only owner)
     * @param _newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee too high");
        platformFeeBps = _newFeeBps;
    }

    /**
     * @dev Get transaction details
     * @param _transactionId Transaction identifier
     */
    function getTransaction(bytes32 _transactionId)
        external
        view
        returns (
            address buyer,
            address seller,
            uint256 amount,
            string memory propertyId,
            TransactionState state,
            bool sellerApproved,
            bool buyerApproved
        )
    {
        Transaction memory txn = transactions[_transactionId];
        return (
            txn.buyer,
            txn.seller,
            txn.amount,
            txn.propertyId,
            txn.state,
            txn.sellerApproved,
            txn.buyerApproved
        );
    }

    /**
     * @dev Get user's transaction IDs
     * @param _user User address
     */
    function getUserTransactions(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        return userTransactions[_user];
    }
}
