package com.ems.company.dto;

import java.util.List;

public class CompanyOwnerDashboardResponse {
  private Long companyId;
  private String companyName;
  private String registrationStatus;
  private Boolean isActive;
  private long totalAdmins;
  private long activeAdmins;
  private long inactiveAdmins;
  private long invitedAdmins;
  private long totalEmployees;
  private long activeEmployees;
  private List<CompanyAdminResponse> recentAdmins;

  private long employeesAddedThisMonth;
  private long employeesAddedLastMonth;
  private double employeesGrowthPercent;   // e.g. 18.0 → show 18%
  private String companyCode;
  private String organizationStatus;      // "Active" / "Inactive"
  private String accountType;

  public Long getCompanyId() { return companyId; }
  public void setCompanyId(Long companyId) { this.companyId = companyId; }
  public String getCompanyName() { return companyName; }
  public void setCompanyName(String companyName) { this.companyName = companyName; }
  public String getRegistrationStatus() { return registrationStatus; }
  public void setRegistrationStatus(String registrationStatus) { this.registrationStatus = registrationStatus; }
  public Boolean getIsActive() { return isActive; }
  public void setIsActive(Boolean isActive) { this.isActive = isActive; }
  public long getTotalAdmins() { return totalAdmins; }
  public void setTotalAdmins(long totalAdmins) { this.totalAdmins = totalAdmins; }
  public long getActiveAdmins() { return activeAdmins; }
  public void setActiveAdmins(long activeAdmins) { this.activeAdmins = activeAdmins; }
  public long getInactiveAdmins() { return inactiveAdmins; }
  public void setInactiveAdmins(long inactiveAdmins) { this.inactiveAdmins = inactiveAdmins; }
  public long getInvitedAdmins() { return invitedAdmins; }
  public void setInvitedAdmins(long invitedAdmins) { this.invitedAdmins = invitedAdmins; }
  public long getTotalEmployees() { return totalEmployees; }
  public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }
  public long getActiveEmployees() { return activeEmployees; }
  public void setActiveEmployees(long activeEmployees) { this.activeEmployees = activeEmployees; }
  public List<CompanyAdminResponse> getRecentAdmins() { return recentAdmins; }
  public void setRecentAdmins(List<CompanyAdminResponse> recentAdmins) { this.recentAdmins = recentAdmins; }


    public long getEmployeesAddedThisMonth() { return employeesAddedThisMonth; }
    public void setEmployeesAddedThisMonth(long employeesAddedThisMonth) {
      this.employeesAddedThisMonth = employeesAddedThisMonth;
    }

    public long getEmployeesAddedLastMonth() { return employeesAddedLastMonth; }
    public void setEmployeesAddedLastMonth(long employeesAddedLastMonth) {
      this.employeesAddedLastMonth = employeesAddedLastMonth;
    }

    public double getEmployeesGrowthPercent() { return employeesGrowthPercent; }
    public void setEmployeesGrowthPercent(double employeesGrowthPercent) {
      this.employeesGrowthPercent = employeesGrowthPercent;
    }

    public String getCompanyCode() { return companyCode; }
    public void setCompanyCode(String companyCode) { this.companyCode = companyCode; }

    public String getOrganizationStatus() { return organizationStatus; }
    public void setOrganizationStatus(String organizationStatus) {
      this.organizationStatus = organizationStatus;
    }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
}
