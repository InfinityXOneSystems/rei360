"""
Google Workspace Integration System
Complete integration with Google Docs, Sheets, Drive, Calendar, Gmail
Automated document creation, data sync, and workflow management
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pathlib import Path
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from google.cloud import firestore
import io


class GoogleWorkspaceSystem:
    """
    Master Google Workspace integration
    Automates all Google Workspace operations
    """
    
    SCOPES = [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
    ]
    
    def __init__(self, credentials_path: str, firestore_project: str):
        self.credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=self.SCOPES
        )
        
        # Initialize Google Workspace services
        self.docs_service = build('docs', 'v1', credentials=self.credentials)
        self.sheets_service = build('sheets', 'v4', credentials=self.credentials)
        self.drive_service = build('drive', 'v3', credentials=self.credentials)
        self.calendar_service = build('calendar', 'v3', credentials=self.credentials)
        self.gmail_service = build('gmail', 'v1', credentials=self.credentials)
        
        # Firestore for tracking
        self.firestore_db = firestore.Client(project=firestore_project)
        
        # Integration modules
        self.docs = GoogleDocsIntegration(self.docs_service, self.drive_service, self.firestore_db)
        self.sheets = GoogleSheetsIntegration(self.sheets_service, self.drive_service, self.firestore_db)
        self.drive = GoogleDriveIntegration(self.drive_service, self.firestore_db)
        self.calendar = GoogleCalendarIntegration(self.calendar_service, self.firestore_db)
        self.gmail = GoogleGmailIntegration(self.gmail_service, self.firestore_db)


class GoogleDocsIntegration:
    """Google Docs automation"""
    
    def __init__(self, docs_service, drive_service, firestore_db):
        self.docs_service = docs_service
        self.drive_service = drive_service
        self.firestore_db = firestore_db
    
    def create_document(self, title: str, content: str = "", folder_id: Optional[str] = None) -> Dict:
        """Create new Google Doc with content"""
        
        # Create document
        doc = self.docs_service.documents().create(body={'title': title}).execute()
        doc_id = doc['documentId']
        
        # Add content if provided
        if content:
            self.insert_text(doc_id, content)
        
        # Move to folder if specified
        if folder_id:
            self.drive_service.files().update(
                fileId=doc_id,
                addParents=folder_id,
                fields='id, parents'
            ).execute()
        
        # Track creation
        self._track_document(doc_id, title, 'created')
        
        return {
            'document_id': doc_id,
            'title': title,
            'url': f"https://docs.google.com/document/d/{doc_id}/edit"
        }
    
    def insert_text(self, document_id: str, text: str, index: int = 1) -> bool:
        """Insert text at specified index"""
        
        requests = [{
            'insertText': {
                'location': {'index': index},
                'text': text
            }
        }]
        
        self.docs_service.documents().batchUpdate(
            documentId=document_id,
            body={'requests': requests}
        ).execute()
        
        return True
    
    def append_text(self, document_id: str, text: str) -> bool:
        """Append text to end of document"""
        
        # Get document to find end index
        doc = self.docs_service.documents().get(documentId=document_id).execute()
        end_index = doc['body']['content'][-1]['endIndex'] - 1
        
        return self.insert_text(document_id, text, end_index)
    
    def format_text(self, document_id: str, start_index: int, end_index: int, 
                   bold: bool = False, italic: bool = False, 
                   font_size: int = None, heading: int = None) -> bool:
        """Apply formatting to text range"""
        
        requests = []
        
        if bold or italic:
            requests.append({
                'updateTextStyle': {
                    'range': {'startIndex': start_index, 'endIndex': end_index},
                    'textStyle': {
                        'bold': bold,
                        'italic': italic
                    },
                    'fields': 'bold,italic'
                }
            })
        
        if font_size:
            requests.append({
                'updateTextStyle': {
                    'range': {'startIndex': start_index, 'endIndex': end_index},
                    'textStyle': {'fontSize': {'magnitude': font_size, 'unit': 'PT'}},
                    'fields': 'fontSize'
                }
            })
        
        if heading:
            requests.append({
                'updateParagraphStyle': {
                    'range': {'startIndex': start_index, 'endIndex': end_index},
                    'paragraphStyle': {'namedStyleType': f'HEADING_{heading}'},
                    'fields': 'namedStyleType'
                }
            })
        
        if requests:
            self.docs_service.documents().batchUpdate(
                documentId=document_id,
                body={'requests': requests}
            ).execute()
        
        return True
    
    def get_document_content(self, document_id: str) -> str:
        """Get full document content as text"""
        
        doc = self.docs_service.documents().get(documentId=document_id).execute()
        
        content = []
        for element in doc['body']['content']:
            if 'paragraph' in element:
                for elem in element['paragraph']['elements']:
                    if 'textRun' in elem:
                        content.append(elem['textRun']['content'])
        
        return ''.join(content)
    
    def create_report(self, title: str, data: Dict, template: str = "standard") -> Dict:
        """Create formatted report from data"""
        
        doc = self.create_document(title)
        doc_id = doc['document_id']
        
        # Generate report content
        if template == "standard":
            content = self._generate_standard_report(data)
        elif template == "executive":
            content = self._generate_executive_report(data)
        else:
            content = json.dumps(data, indent=2)
        
        self.insert_text(doc_id, content)
        
        return doc
    
    def _generate_standard_report(self, data: Dict) -> str:
        """Generate standard report format"""
        
        report = []
        report.append(f"REPORT GENERATED: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n")
        
        for section, content in data.items():
            report.append(f"\n{section.upper()}\n")
            report.append("-" * 50 + "\n")
            
            if isinstance(content, dict):
                for key, value in content.items():
                    report.append(f"{key}: {value}\n")
            elif isinstance(content, list):
                for item in content:
                    report.append(f"  • {item}\n")
            else:
                report.append(f"{content}\n")
        
        return ''.join(report)
    
    def _generate_executive_report(self, data: Dict) -> str:
        """Generate executive summary format"""
        
        report = []
        report.append("EXECUTIVE SUMMARY\n\n")
        
        if 'summary' in data:
            report.append(f"{data['summary']}\n\n")
        
        report.append("KEY INSIGHTS\n")
        if 'insights' in data:
            for insight in data['insights']:
                report.append(f"  ✓ {insight}\n")
        
        report.append("\n")
        return ''.join(report)
    
    def _track_document(self, doc_id: str, title: str, action: str):
        """Track document operations"""
        self.firestore_db.collection('workspace_docs').document(doc_id).set({
            'title': title,
            'action': action,
            'timestamp': datetime.utcnow()
        }, merge=True)


class GoogleSheetsIntegration:
    """Google Sheets automation"""
    
    def __init__(self, sheets_service, drive_service, firestore_db):
        self.sheets_service = sheets_service
        self.drive_service = drive_service
        self.firestore_db = firestore_db
    
    def create_spreadsheet(self, title: str, sheets: List[str] = None) -> Dict:
        """Create new spreadsheet"""
        
        body = {
            'properties': {'title': title},
            'sheets': [{'properties': {'title': sheet}} for sheet in (sheets or ['Sheet1'])]
        }
        
        spreadsheet = self.sheets_service.spreadsheets().create(body=body).execute()
        
        return {
            'spreadsheet_id': spreadsheet['spreadsheetId'],
            'title': title,
            'url': f"https://docs.google.com/spreadsheets/d/{spreadsheet['spreadsheetId']}/edit"
        }
    
    def write_data(self, spreadsheet_id: str, range_name: str, values: List[List[Any]]) -> bool:
        """Write data to sheet"""
        
        body = {'values': values}
        
        self.sheets_service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        
        return True
    
    def read_data(self, spreadsheet_id: str, range_name: str) -> List[List[Any]]:
        """Read data from sheet"""
        
        result = self.sheets_service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()
        
        return result.get('values', [])
    
    def append_data(self, spreadsheet_id: str, range_name: str, values: List[List[Any]]) -> bool:
        """Append data to sheet"""
        
        body = {'values': values}
        
        self.sheets_service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        
        return True
    
    def create_dashboard(self, title: str, data: Dict) -> Dict:
        """Create dashboard spreadsheet from data"""
        
        # Create spreadsheet with multiple sheets
        sheets = ['Overview', 'Metrics', 'Timeline', 'Raw Data']
        spreadsheet = self.create_spreadsheet(title, sheets)
        spreadsheet_id = spreadsheet['spreadsheet_id']
        
        # Populate Overview
        if 'overview' in data:
            overview_data = [[k, v] for k, v in data['overview'].items()]
            self.write_data(spreadsheet_id, 'Overview!A1', overview_data)
        
        # Populate Metrics
        if 'metrics' in data:
            headers = [list(data['metrics'].keys())]
            values = [list(data['metrics'].values())]
            self.write_data(spreadsheet_id, 'Metrics!A1', headers + values)
        
        return spreadsheet
    
    def create_formula(self, spreadsheet_id: str, sheet_name: str, 
                      cell: str, formula: str) -> bool:
        """Insert formula into cell"""
        
        return self.write_data(spreadsheet_id, f"{sheet_name}!{cell}", [[formula]])


class GoogleDriveIntegration:
    """Google Drive automation"""
    
    def __init__(self, drive_service, firestore_db):
        self.drive_service = drive_service
        self.firestore_db = firestore_db
    
    def create_folder(self, folder_name: str, parent_id: Optional[str] = None) -> str:
        """Create folder in Drive"""
        
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        
        if parent_id:
            file_metadata['parents'] = [parent_id]
        
        folder = self.drive_service.files().create(
            body=file_metadata,
            fields='id'
        ).execute()
        
        return folder['id']
    
    def upload_file(self, file_path: str, folder_id: Optional[str] = None) -> Dict:
        """Upload file to Drive"""
        
        file_metadata = {'name': Path(file_path).name}
        
        if folder_id:
            file_metadata['parents'] = [folder_id]
        
        media = MediaFileUpload(file_path, resumable=True)
        
        file = self.drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink'
        ).execute()
        
        return {
            'file_id': file['id'],
            'name': file['name'],
            'url': file['webViewLink']
        }
    
    def download_file(self, file_id: str, destination: str) -> str:
        """Download file from Drive"""
        
        request = self.drive_service.files().get_media(fileId=file_id)
        
        fh = io.FileIO(destination, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
        
        return destination
    
    def list_files(self, folder_id: Optional[str] = None, 
                   mime_type: Optional[str] = None) -> List[Dict]:
        """List files in Drive"""
        
        query_parts = []
        
        if folder_id:
            query_parts.append(f"'{folder_id}' in parents")
        
        if mime_type:
            query_parts.append(f"mimeType='{mime_type}'")
        
        query = ' and '.join(query_parts) if query_parts else None
        
        results = self.drive_service.files().list(
            q=query,
            pageSize=100,
            fields="files(id, name, mimeType, modifiedTime, webViewLink)"
        ).execute()
        
        return results.get('files', [])
    
    def share_file(self, file_id: str, email: str, role: str = 'reader') -> bool:
        """Share file with user"""
        
        permission = {
            'type': 'user',
            'role': role,
            'emailAddress': email
        }
        
        self.drive_service.permissions().create(
            fileId=file_id,
            body=permission,
            sendNotificationEmail=True
        ).execute()
        
        return True
    
    def organize_workspace(self, project_name: str) -> Dict:
        """Create organized folder structure"""
        
        # Create main project folder
        main_folder_id = self.create_folder(project_name)
        
        # Create subfolders
        subfolders = {
            'Documents': self.create_folder('Documents', main_folder_id),
            'Spreadsheets': self.create_folder('Spreadsheets', main_folder_id),
            'Reports': self.create_folder('Reports', main_folder_id),
            'Data': self.create_folder('Data', main_folder_id),
            'Archive': self.create_folder('Archive', main_folder_id)
        }
        
        return {
            'main_folder_id': main_folder_id,
            'subfolders': subfolders
        }


class GoogleCalendarIntegration:
    """Google Calendar automation"""
    
    def __init__(self, calendar_service, firestore_db):
        self.calendar_service = calendar_service
        self.firestore_db = firestore_db
    
    def create_event(self, summary: str, start_time: datetime, 
                    end_time: datetime, description: str = "",
                    attendees: List[str] = None) -> Dict:
        """Create calendar event"""
        
        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            }
        }
        
        if attendees:
            event['attendees'] = [{'email': email} for email in attendees]
        
        created_event = self.calendar_service.events().insert(
            calendarId='primary',
            body=event,
            sendUpdates='all'
        ).execute()
        
        return {
            'event_id': created_event['id'],
            'html_link': created_event.get('htmlLink')
        }
    
    def list_upcoming_events(self, max_results: int = 10) -> List[Dict]:
        """List upcoming events"""
        
        now = datetime.utcnow().isoformat() + 'Z'
        
        events_result = self.calendar_service.events().list(
            calendarId='primary',
            timeMin=now,
            maxResults=max_results,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        return events_result.get('items', [])
    
    def schedule_meeting(self, title: str, duration_minutes: int,
                        attendees: List[str], description: str = "") -> Dict:
        """Schedule meeting with auto time selection"""
        
        # Find next available slot
        start_time = datetime.utcnow() + timedelta(hours=1)
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        return self.create_event(title, start_time, end_time, description, attendees)


class GoogleGmailIntegration:
    """Gmail automation"""
    
    def __init__(self, gmail_service, firestore_db):
        self.gmail_service = gmail_service
        self.firestore_db = firestore_db
    
    def send_email(self, to: str, subject: str, body: str, 
                   html: bool = False, attachments: List[str] = None) -> Dict:
        """Send email"""
        
        import base64
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        message = MIMEMultipart() if attachments else MIMEText(body, 'html' if html else 'plain')
        
        if attachments:
            message.attach(MIMEText(body, 'html' if html else 'plain'))
        
        message['to'] = to
        message['subject'] = subject
        
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        sent_message = self.gmail_service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        return {'message_id': sent_message['id']}
    
    def send_report(self, to: str, report_title: str, report_data: Dict) -> Dict:
        """Send formatted report via email"""
        
        html_body = self._generate_html_report(report_title, report_data)
        
        return self.send_email(to, f"Report: {report_title}", html_body, html=True)
    
    def _generate_html_report(self, title: str, data: Dict) -> str:
        """Generate HTML email report"""
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h1>{title}</h1>
            <p><em>Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</em></p>
            <hr>
        """
        
        for section, content in data.items():
            html += f"<h2>{section}</h2>"
            
            if isinstance(content, dict):
                html += "<ul>"
                for key, value in content.items():
                    html += f"<li><strong>{key}:</strong> {value}</li>"
                html += "</ul>"
            elif isinstance(content, list):
                html += "<ul>"
                for item in content:
                    html += f"<li>{item}</li>"
                html += "</ul>"
            else:
                html += f"<p>{content}</p>"
        
        html += "</body></html>"
        
        return html


if __name__ == "__main__":
    # Example usage
    workspace = GoogleWorkspaceSystem(
        credentials_path="path/to/credentials.json",
        firestore_project="real-estate-intelligence"
    )
    
    # Create a document
    doc = workspace.docs.create_document(
        title="Property Analysis Report",
        content="This is a comprehensive property analysis..."
    )
    print(f"Created doc: {doc['url']}")
    
    # Create a spreadsheet
    sheet = workspace.sheets.create_spreadsheet(
        title="Market Data Dashboard",
        sheets=['Overview', 'Trends', 'Comparables']
    )
    print(f"Created sheet: {sheet['url']}")
    
    # Schedule a meeting
    meeting = workspace.calendar.schedule_meeting(
        title="Property Review Meeting",
        duration_minutes=60,
        attendees=["team@example.com"],
        description="Review latest property analysis"
    )
    print(f"Scheduled meeting: {meeting['event_id']}")
