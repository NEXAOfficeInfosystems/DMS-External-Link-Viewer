import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DataRoomApiService } from 'src/app/core/services/DataRoomApiService.service';
import { EncryptionService } from 'src/app/core/services/encryption.service';




interface DataRoom {
  id: string;
  name: string;
  expires: string;
  users: number;
  files: number;
  userDetails?: any[];
  fileDetails?: any[];
  defaultPermissions?: any;
  storage?: any;
}

interface AuditLog {
  dataRoomName: string;
  documentName: string;
  UserName: string;
  actionName: string;
  actionBy: string;
  actionDate: string;
}

@Component({
  selector: 'app-expired',
  templateUrl: './expired.component.html',
  styleUrls: ['./expired.component.scss']
})
export class ExpiredComponent implements AfterViewInit, OnInit, OnDestroy {
  showDataRoomDetail: boolean = false;
  dataRoomTitle: string = '';
  isListView = true;
  isExpiredListView = true;
  sub$: Subscription = new Subscription();

  numCols = 3;
  rowHeight = '1:1';
  gutterSize = '10';
  listViewHeight = '70px';

  dataRooms: DataRoom[] = [];
  expiredRooms: any[] = [];
  auditLogs: AuditLog[] = [];

  dataSource = new MatTableDataSource<DataRoom>(this.dataRooms);
  expiredDataSource = new MatTableDataSource<DataRoom>(this.expiredRooms);
  auditDataSource = new MatTableDataSource<AuditLog>(this.auditLogs);

  displayedColumns: string[] = ['name', 'expires', 'users', 'files', 'actions'];
  expiredDisplayedColumns: string[] = ['name', 'expiredDate', 'users', 'files', 'actions'];
  auditDisplayedColumns: string[] = [
    'dataRoomName',
    'documentName',
    'UserName',
    'actionName',
    'actionBy',
    'actionDate',
  ];

  @ViewChild('paginatorActive') paginatorActive!: MatPaginator;
  @ViewChild('paginatorExpired') paginatorExpired!: MatPaginator;
  @ViewChild('paginatorAudit') paginatorAudit!: MatPaginator;

  selectedTabIndex = 0;

  pagedDataRooms: DataRoom[] = [];
  pageSize = 10;
  currentPage = 0;

  pagedExpiredRooms: DataRoom[] = [];
  expiredPageSize = 10;
  expiredCurrentPage = 0;

  pagedAuditLogs: AuditLog[] = [];
  auditPageSize = 10;
  auditCurrentPage = 0;

  searchExpanded: boolean = false;
  searchTerm: string = '';

  filteredDataRooms: DataRoom[] = [];
  filteredExpiredRooms: any[] = [];
  filteredAuditLogs: AuditLog[] = [];


  //below is for permissions
  dataRoomPermissions: any[] = [];
  userPermissions: any[] = [];
  documentPermissions: any[] = [];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private manageDataRoomService: DataRoomApiService,
    private toastrService: ToastrService,
    private encryptionService: EncryptionService // Added EncryptionService
  ) {
    this.setCardView();
  }

  ngOnInit() {
    this.getAllRoomInfo();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginatorActive;
    this.expiredDataSource.paginator = this.paginatorExpired;
    this.auditDataSource.paginator = this.paginatorAudit;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    const width = window.innerWidth;
    if (width < 600) {
      this.numCols = 1;
    } else if (width < 960) {
      this.numCols = 2;
    } else {
      this.numCols = 3;
    }
  }

  toggleView() {
    if (this.selectedTabIndex === 0) {
      this.isListView = !this.isListView;
      this.isListView ? this.setListView() : this.setCardView();
    } else if (this.selectedTabIndex === 1) {
      this.isExpiredListView = !this.isExpiredListView;
      this.isExpiredListView ? this.setListView() : this.setCardView();
    }
  }

  setCardView() {
    this.numCols = 3;
    this.rowHeight = '1:1';
    this.gutterSize = '10';
  }

  setListView() {
    this.numCols = 1;
    this.rowHeight = this.listViewHeight;
    this.gutterSize = '5';
  }

  navigateToDetail(dataRoom: DataRoom): void {
    if (dataRoom) {
      const encryptedPath = this.encryptionService.encrypt(`/dataroom/data-room-detail/${dataRoom.id}`);
      this.router.navigate([encryptedPath], { state: { dataRoom } });
    } else {
      console.error('DataRoom is undefined:', dataRoom);
    }
  }

  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
    if (!this.searchExpanded) this.clearSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applySearchToAllTabs();
  }

  applySearchToAllTabs() {
    const term = this.searchTerm.trim().toLowerCase();

    if (term === '') {
      this.filteredDataRooms = this.dataRooms;
      this.filteredExpiredRooms = this.expiredRooms;
      this.filteredAuditLogs = this.auditLogs;
    } else {
      this.filteredDataRooms = this.dataRooms.filter((room) =>
        room.name.toLowerCase().includes(term) ||
        room.expires.toLowerCase().includes(term) ||
        room.users.toString().includes(term) ||
        room.files.toString().includes(term)
      );

      this.filteredExpiredRooms = this.expiredRooms.filter((room) =>
        room.name.toLowerCase().includes(term) ||
        room.expires.toLowerCase().includes(term) ||
        room.users.toString().includes(term) ||
        room.files.toString().includes(term)
      );

      this.filteredAuditLogs = this.auditLogs.filter((log) =>
        log.dataRoomName.toLowerCase().includes(term) ||
        log.documentName.toLowerCase().includes(term) ||
        log.UserName.toLowerCase().includes(term) ||
        log.actionName.toLowerCase().includes(term) ||
        log.actionBy.toLowerCase().includes(term) ||
        log.actionDate.toLowerCase().includes(term)
      );
    }

    this.updatePagedData();
    this.updatePagedExpiredData();
    this.updatePagedAuditLogs();
  }
getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
  getAllRoomInfo() {
  const dummyExpiredRoomsResponse = {
  expiredRooms: [
    {
      room: {
        id: 201,
        name: 'Finance Reports Q1',
        expirationDate: '2024-03-31T00:00:00Z',
        defaultPermission: 'Viewer'
      },
      files: [
        {
          document: {
            id: 301,
            name: 'IncomeStatement.pdf',
            url: '/assets/docs/IncomeStatement.pdf',
            documentSize: '2.3MB',
            docType: 'pdf'
          }
        },
        {
          document: {
            id: 302,
            name: 'BalanceSheet.xlsx',
            url: '/assets/docs/BalanceSheet.xlsx',
            documentSize: '1.1MB',
            docType: 'xlsx'
          }
        }
      ]
    },
    {
      room: {
        id: 202,
        name: 'HR Compliance',
        expirationDate: '2024-05-15T00:00:00Z',
        defaultPermission: 'Editor'
      },
      files: [
        {
          document: {
            id: 303,
            name: 'Policy_Update.docx',
            url: '/assets/docs/Policy_Update.docx',
            documentSize: '650KB',
            docType: 'docx'
          }
        }
      ]
    }
  ]
};

  
  const expiredRooms = dummyExpiredRoomsResponse.expiredRooms.map((roomWrapper: any) => {
  const room = roomWrapper.room;
  const files = roomWrapper.files || [];

  return {
    id: room.id,
    name: room.name,
    expires: room.expirationDate ? new Date(room.expirationDate).toLocaleDateString() : 'No Expiry',
    permission: room.defaultPermission,
    files: files.length,
    documents: files.map((fileWrapper: any) => {
      const doc = fileWrapper.document;
      return {
        id: doc.id,
        name: doc.name,
        url: doc.url,
        size: doc.documentSize,
        type: doc.docType
      };
    })
  };
});

this.expiredRooms = expiredRooms;
this.filteredExpiredRooms = expiredRooms;
this.updatePagedExpiredData?.();
  
  
//     const MasterUserId = this.getCookie('MasterUserId') || '';
//    this.manageDataRoomService.getAllActiveExpiredDataRooms(MasterUserId).subscribe((res: any) => {
//   console.log('Active and Expired Data Rooms:', res);
//    const dataRoomPermissions = res.permissions?.dataRoomPermissions || [];
//     const userPermissions = res.permissions?.userPermissions || [];
//     const documentPermissions = res.permissions?.documentPermissions || [];


//     this.dataRoomPermissions = dataRoomPermissions;
//     this.userPermissions = userPermissions;
//     this.documentPermissions = documentPermissions;

  
//     console.log('DataRoom Permissions:', this.dataRoomPermissions);
//     console.log('User Permissions:', this.userPermissions);
//     console.log('Document Permissions:', this.documentPermissions);
//   if (res && res.expiredRooms) {
//     const expiredRooms = res.expiredRooms.map((roomWrapper: any) => {
//       const room = roomWrapper.room;
//       const files = roomWrapper.files || [];

//       return {
//         id: room.id,
//         name: room.name,
//         expires: room.expirationDate ? new Date(room.expirationDate).toLocaleDateString() : 'No Expiry',
//         permission: room.defaultPermission,
//         files: files.length,
//         documents: files.map((fileWrapper: any) => {
//           const doc = fileWrapper.document;
//           return {
//             id: doc.id,
//             name: doc.name,
//             url: doc.url,
//             size: doc.documentSize,
//             type: doc.docType
//           };
//         })
//       };
//     });

//     this.dataRooms = expiredRooms;
//     this.filteredDataRooms = expiredRooms;
//     this.updatePagedData();
//   }
// });


  
    // this.manageDataRoomService.getAllAuditLog(clientId, companyId).subscribe((logs: any) => {
    //   if (logs) {
    //     const auditLogs = logs.map((log: any) => ({
    //       dataRoomName: log.dataRoomName || 'Unknown',
    //       documentName: log.documentName || 'N/A',
    //       UserName: log.userName || 'N/A',
    //       actionName: this.formatActionName(log.actionName),
    //       actionBy: log.createdByName || 'Unknown',
    //       actionDate: new Date(log.createdDate).toLocaleDateString(),
    //     }));
    //     this.auditLogs = auditLogs;
    //     this.filteredAuditLogs = auditLogs;
    //     this.updatePagedAuditLogs();
    //   }
    // });
  }

  formatActionName(actionName: string): string {
    const actionMap: { [key: string]: string } = {
      PermissionEdited: 'Permission Edited',
      DocumentCreated: 'Document Created',
      DocumentDeleted: 'Document Deleted',
      DataRoomCreated: 'Data Room Created',
      DataRoomUpdated: 'Data Room Updated',
      DataRoomDeleted: 'Data Room Deleted',
      DocumentViewed: 'Document Viewed',
      UserCreated: 'User Created',
      UserLoggedIn: 'User Logged In',
      UserDeleted: 'User Deleted',
      EmailSended: 'Email Sent',
    };
    return actionMap[actionName] || actionName || 'Unknown Action';
  }

  updatePagedData() {
    const startIndex = this.currentPage * this.pageSize;
    this.pagedDataRooms = this.filteredDataRooms.slice(startIndex, startIndex + this.pageSize);
  }

  updatePagedExpiredData() {
    const startIndex = this.expiredCurrentPage * this.expiredPageSize;
    this.pagedExpiredRooms = this.filteredExpiredRooms.slice(startIndex, startIndex + this.expiredPageSize);
  }

  updatePagedAuditLogs() {
    const startIndex = this.auditCurrentPage * this.auditPageSize;
    this.pagedAuditLogs = this.filteredAuditLogs.slice(startIndex, startIndex + this.auditPageSize);
    this.auditDataSource.data = this.pagedAuditLogs;
  }
openManageDataRoomModal(room: DataRoom): void {
  // Open your manage data room modal
  // console.log('Manage Data Room clicked for:', room);
  this.toastrService.info('Manage Data Room clicked for: ' + room.name);
}

deleteExpiredDataRoom(room: DataRoom): void {
  // Add your delete logic here
  // console.log('Delete Expired Data Room clicked for:', room);
  const confirmed = confirm(`Are you sure you want to delete "${room.name}"?`);
  if (confirmed) {
    this.toastrService.success(`Data Room "${room.name}" deleted.`);
    // Remove from list (for UI simulation)
    this.expiredRooms = this.expiredRooms.filter(r => r.id !== room.id);
    this.filteredExpiredRooms = this.filteredExpiredRooms.filter(r => r.id !== room.id);
    this.updatePagedExpiredData();
  }
}

  ngOnDestroy() {
    this.sub$.unsubscribe();
  }
}
