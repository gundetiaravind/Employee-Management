
package com.ems.finance.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(
    name = "employee_ctc",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_employee_ctc_tenant",
            columnNames = {"employee_id", "tenant_id"}
        )
    }
)
public class EmployeeCtc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    // CTC breakup
    private BigDecimal totalAnnualCtc;
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal specialAllowance;
    private BigDecimal otherAllowances;

    public EmployeeCtc() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public BigDecimal getTotalAnnualCtc() {
        return totalAnnualCtc;
    }

    public void setTotalAnnualCtc(BigDecimal totalAnnualCtc) {
        this.totalAnnualCtc = totalAnnualCtc;
    }

    public BigDecimal getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(BigDecimal basicSalary) {
        this.basicSalary = basicSalary;
    }

    public BigDecimal getHra() {
        return hra;
    }

    public void setHra(BigDecimal hra) {
        this.hra = hra;
    }

    public BigDecimal getSpecialAllowance() {
        return specialAllowance;
    }

    public void setSpecialAllowance(BigDecimal specialAllowance) {
        this.specialAllowance = specialAllowance;
    }

    public BigDecimal getOtherAllowances() {
        return otherAllowances;
    }

    public void setOtherAllowances(BigDecimal otherAllowances) {
        this.otherAllowances = otherAllowances;
    }
}
