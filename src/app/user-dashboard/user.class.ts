export class AlertPopup {
    show: boolean;
    message: string;
    confirm: boolean;
    header: string;
    type: string;
    callfrom: string;
    deleteType: string;
}

export class UserProfile {
    UserTypeId: string;
    UserType: string;
    LoginTypeId: string;
    LoginType: string;
    FirstName: string;
    LastName: string;
    UserName: string;
    Email: string;
    PhoneNumber: number;
    Address: string;
    Id: string;
    IsActive: boolean;
    IsDeleted: boolean;
    IsApproved: boolean;
    IsRejected: boolean;
    CreatedOn: string;
    CreatorId: string;
    CreatorName: string;
    ModifiedOn: string;
    ModifierId: string;
    ModifierName: string;
    ApprovedOn: string;
    ApproverId: string;
    ApproverName: string;
    RejectedOn: string;
    RejectorId: string;
    RejectorName: string;
    RejectionComments: string;
    Roles: RoleObj;
}

export class RoleObj {
    RoleName: string;
    Description: string;
    Id: string;
    IsActive: boolean;
    IsDeleted: boolean;
    IsApproved: boolean;
    IsRejected: boolean;
    CreatedOn: string;
    CreatorId: string;
    CreatorName: string;
    ModifiedOn: string;
    ModifierId: string;
    ModifierName: string;
    ApprovedOn: string;
    ApproverId: string;
    ApproverName: string;
    RejectedOn: null;
    RejectorId: string;
    RejectorName: string;
    RejectionComments: string;
}