import { useState, useMemo, useCallback, useEffect } from 'react';
import type { 
  EmployeeItem, 
  DepartmentType, 
  EmployeeStats, 
  AddEmployeeFormData 
} from '../types/employee.types';
import { adminService } from '../services/admin-service';
import toast from 'react-hot-toast';

export const useEmployeeManagement = () => {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [serverStats, setServerStats] = useState<EmployeeStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDepartment, setActiveDepartment] = useState<DepartmentType>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Add / Edit Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);

  // Confirm Action Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: '',
    variant: 'warning',
    onConfirm: () => {},
  });

  // Fetch employees from live server
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getEmployees({
        search: searchQuery.trim() || undefined,
        department: activeDepartment !== 'ALL' ? activeDepartment : undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      });

      if (res?.data) {
        setEmployees(res.data.employees || []);
        setServerStats(res.data.stats || null);
      }
    } catch (error: any) {
      const msg = error?.message || 'Failed to load staff members from server';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeDepartment, roleFilter]);

  // Trigger fetch on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Derived KPI Stats
  const stats: EmployeeStats = useMemo(() => {
    if (serverStats) return serverStats;

    let documenters = 0;
    let sales = 0;
    let fileOperators = 0;
    let admins = 0;
    let activeCount = 0;

    employees.forEach((emp) => {
      if (emp.department === 'DOC') documenters++;
      if (emp.department === 'SALES') sales++;
      if (emp.department === 'FILE_OP') fileOperators++;
      if (emp.department === 'ADMIN') admins++;
      if (emp.isActive) activeCount++;
    });

    return {
      total: employees.length,
      documenters,
      sales,
      fileOperators,
      admins,
      activeCount,
      inactiveCount: employees.length - activeCount,
    };
  }, [employees, serverStats]);

  // Open Drawer for new employee
  const handleOpenAddDrawer = useCallback(() => {
    setEditingEmployee(null);
    setIsDrawerOpen(true);
  }, []);

  // Open Drawer to edit existing employee (only allowed if active)
  const handleOpenEditDrawer = useCallback((employee: EmployeeItem) => {
    if (!employee.isActive) {
      toast.error(`Cannot edit inactive staff member. Please activate ${employee.fullName} first.`);
      return;
    }
    setEditingEmployee(employee);
    setIsDrawerOpen(true);
  }, []);

  // Save single employee (Create / Update via API)
  const handleSaveEmployee = useCallback(
    async (formData: AddEmployeeFormData) => {
      setIsSaving(true);
      try {
        if (editingEmployee) {
          await adminService.updateEmployee(editingEmployee.id, formData);
          toast.success(`Updated staff record for ${formData.firstName} ${formData.lastName}`);
        } else {
          await adminService.createEmployee(formData);
          toast.success(`Created staff member: ${formData.firstName} ${formData.lastName}`);
        }

        setIsDrawerOpen(false);
        setEditingEmployee(null);
        await fetchEmployees();
      } catch (error: any) {
        const msg = error?.message || 'Failed to save staff record';
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [editingEmployee, fetchEmployees]
  );

  // Toggle Employee Status (Active / Inactive via API with Confirmation)
  const handleToggleStatus = useCallback(
    (employee: EmployeeItem) => {
      const newStatus = !employee.isActive;
      setConfirmDialog({
        isOpen: true,
        title: newStatus ? 'Activate Staff Member' : 'Deactivate Staff Member',
        description: newStatus
          ? `Are you sure you want to activate ${employee.fullName}? They will regain active operational access to their assigned department queues.`
          : `Are you sure you want to set ${employee.fullName} to Inactive? Inactive staff will not receive new leads, and duplicate checks will ignore inactive accounts.`,
        confirmLabel: newStatus ? 'Set Active' : 'Set Inactive',
        variant: newStatus ? 'success' : 'warning',
        onConfirm: async () => {
          try {
            await adminService.toggleEmployeeStatus(employee.id);
            setConfirmDialog((c) => ({ ...c, isOpen: false }));
            toast.success(`${employee.fullName} is now ${newStatus ? 'Active' : 'Inactive'}`);
            await fetchEmployees();
          } catch (error: any) {
            toast.error(error?.message || 'Failed to update staff status');
          }
        },
      });
    },
    [fetchEmployees]
  );

  // Bulk Onboard Staff via API
  const handleBulkOnboardSuccess = useCallback(
    async (parsedStaffList: EmployeeItem[]) => {
      try {
        const payload = parsedStaffList.map((s) => ({
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          mobile: s.mobile,
          role: s.role,
          isActive: s.isActive,
        }));

        const res = await adminService.bulkOnboardEmployees(payload);
        setIsBulkModalOpen(false);
        const count = res?.data?.createdCount ?? payload.length;
        const skipped = res?.data?.duplicatesSkipped ?? 0;
        toast.success(`Successfully onboarded ${count} staff members (${skipped} active duplicates skipped)!`, {
          duration: 5000,
        });
        await fetchEmployees();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to bulk onboard staff');
      }
    },
    [fetchEmployees]
  );

  return {
    employees,
    filteredEmployees: employees,
    stats,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    roleFilter,
    setRoleFilter,
    isDrawerOpen,
    setIsDrawerOpen,
    editingEmployee,
    isBulkModalOpen,
    setIsBulkModalOpen,
    confirmDialog,
    setConfirmDialog,
    fetchEmployees,
    handleOpenAddDrawer,
    handleOpenEditDrawer,
    handleSaveEmployee,
    handleToggleStatus,
    handleBulkOnboardSuccess,
  };
};
