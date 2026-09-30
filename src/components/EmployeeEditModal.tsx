import React, { useState, useEffect } from 'react';
import { Employee, WorkflowStatus, ActionType } from '../types/hr';
import { X, Save, UserCheck, AlertCircle } from 'lucide-react';

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (employee: Employee, isNew: boolean) => void;
  departments: string[];
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
  departments,
}) => {
  const isNew = !employee;

  const [formData, setFormData] = useState<Partial<Employee>>({
    employeeCode: 'MP10' + Math.floor(100 + Math.random() * 900),
    name: '',
    nric: '',
    businessUnit: 'Media Prima Berhad',
    department: departments[0] || 'Group Finance',
    positionTitle: '',
    jobGrade: 'E2',
    dateJoined: new Date().toISOString().split('T')[0],
    contractExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actionType: 'Contract Renewal',
    currentSalary: 5500,
    superiorName: 'Dato\' Kamarul Ariffin bin Isa',
    superiorDesignation: 'Head of Department',
    hodName: 'Dato\' Kamarul Ariffin bin Isa',
    status: 'Pending Email',
    remarks: '',
  });

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        employeeCode: 'MP10' + Math.floor(100 + Math.random() * 900),
        name: '',
        nric: '940101-14-' + Math.floor(1000 + Math.random() * 9000),
        businessUnit: 'Media Prima Berhad',
        department: departments[0] || 'Group Finance',
        positionTitle: '',
        jobGrade: 'E2',
        dateJoined: '2024-10-01',
        contractExpiryDate: '2026-10-31',
        actionType: 'Contract Renewal',
        currentSalary: 5500,
        superiorName: 'Dato\' Kamarul Ariffin bin Isa',
        superiorDesignation: 'Head of Department',
        hodName: 'Dato\' Kamarul Ariffin bin Isa',
        status: 'Pending Email',
        remarks: '',
      });
    }
  }, [employee, departments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Please provide the employee full name');
      return;
    }
    if (!formData.positionTitle?.trim()) {
      setError('Please provide the position title');
      return;
    }

    const finalEmployee: Employee = {
      id: employee?.id || `emp-${Date.now()}`,
      employeeCode: formData.employeeCode || `MP10${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      nric: formData.nric || '900101-10-5000',
      businessUnit: formData.businessUnit || 'Media Prima Berhad',
      department: formData.department || departments[0],
      positionTitle: formData.positionTitle.trim(),
      jobGrade: formData.jobGrade || 'E2',
      dateJoined: formData.dateJoined || '2024-01-01',
      contractExpiryDate: formData.contractExpiryDate || '2026-10-31',
      actionType: (formData.actionType as ActionType) || 'Contract Renewal',
      currentSalary: Number(formData.currentSalary) || 5000,
      superiorName: formData.superiorName || 'Head of Department',
      superiorDesignation: formData.superiorDesignation || 'HOD',
      hodName: formData.hodName || formData.superiorName || 'HOD',
      status: (formData.status as WorkflowStatus) || 'Pending Email',
      remarks: formData.remarks || '',
      emailSentDate: employee?.emailSentDate || null,
      mrfData: employee?.mrfData,
      letterData: employee?.letterData,
    };

    onSave(finalEmployee, isNew);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isNew ? 'Add New Employee Record' : 'Edit Employee Details'}
              </h2>
              <p className="text-xs text-slate-500">
                {isNew ? 'Enroll employee into renewal/probation pipeline' : `Updating ${employee?.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Employee Full Name: *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Nurul Izzati binti Zamri"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Staff ID / Employee Code: *
              </label>
              <input
                type="text"
                required
                value={formData.employeeCode || ''}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                placeholder="e.g. MP10850"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                NRIC No / Passport:
              </label>
              <input
                type="text"
                value={formData.nric || ''}
                onChange={(e) => setFormData({ ...formData, nric: e.target.value })}
                placeholder="e.g. 940512-14-5820"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Business Unit:
              </label>
              <select
                value={formData.businessUnit || 'Media Prima Berhad'}
                onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
              >
                <option value="Media Prima Berhad">Media Prima Berhad</option>
                <option value="Media Prima Digital">Media Prima Digital</option>
                <option value="Rev Media Group">Rev Media Group</option>
                <option value="TV3 & Network Broadcast">TV3 & Network Broadcast</option>
                <option value="New Straits Times Press (NSTP)">New Straits Times Press (NSTP)</option>
                <option value="Big Tree Outdoor">Big Tree Outdoor</option>
                <option value="Media Prima Omnia">Media Prima Omnia</option>
                <option value="Audio+ (Fly FM & Hot FM)">Audio+ (Fly FM & Hot FM)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Department:
              </label>
              <select
                value={formData.department || departments[0]}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Position Title: *
              </label>
              <input
                type="text"
                required
                value={formData.positionTitle || ''}
                onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                placeholder="e.g. Senior Broadcast Engineer"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Job Grade:
              </label>
              <select
                value={formData.jobGrade || 'E2'}
                onChange={(e) => setFormData({ ...formData, jobGrade: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-mono"
              >
                <option value="C1">C1 - Clerical / Junior</option>
                <option value="E1">E1 - Executive</option>
                <option value="E2">E2 - Senior Executive</option>
                <option value="E3">E3 - Lead Specialist</option>
                <option value="M1">M1 - Assistant Manager</option>
                <option value="M2">M2 - Manager</option>
                <option value="M3">M3 - Senior Manager</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Action Type:
              </label>
              <select
                value={formData.actionType || 'Contract Renewal'}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value as ActionType })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-medium"
              >
                <option value="Contract Renewal">Contract Renewal</option>
                <option value="Probation Confirmation">Probation Confirmation</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Date Joined:
              </label>
              <input
                type="date"
                value={formData.dateJoined || ''}
                onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Contract Expiry / Review Due Date: *
              </label>
              <input
                type="date"
                required
                value={formData.contractExpiryDate || ''}
                onChange={(e) => setFormData({ ...formData, contractExpiryDate: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-mono font-bold text-rose-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Current Basic Salary (RM):
              </label>
              <input
                type="number"
                value={formData.currentSalary || 5000}
                onChange={(e) => setFormData({ ...formData, currentSalary: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Workflow Lifecycle Status:
              </label>
              <select
                value={formData.status || 'Pending Email'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkflowStatus })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-semibold"
              >
                <option value="Pending Email">Pending Email</option>
                <option value="Pending Reminder">Pending Reminder</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Submission of MRF">Submission of MRF</option>
                <option value="Letter Preparation">Letter Preparation</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Direct Superior / Supervisor Name:
              </label>
              <input
                type="text"
                value={formData.superiorName || ''}
                onChange={(e) => setFormData({ ...formData, superiorName: e.target.value })}
                placeholder="e.g. Ts. Dr. Kevin Chong"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Head of Department (HOD) Name:
              </label>
              <input
                type="text"
                value={formData.hodName || ''}
                onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                placeholder="e.g. Dato' Kamarul Ariffin bin Isa"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Performance Remarks & Operational Notes:
            </label>
            <textarea
              rows={2}
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Excellent work in Q3 digital transformation deliverables..."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isNew ? 'Create Employee Record' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
