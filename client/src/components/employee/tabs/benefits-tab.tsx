import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, Users, Clock, Plus, Edit, Trash2, Shield, 
  DollarSign, Eye, Stethoscope, Briefcase, Car, 
  GraduationCap, Gift, Calendar
} from "lucide-react";
import type { Benefit, InsertBenefit, Dependent, InsertDependent } from "@shared/schema";

interface BenefitsTabProps {
  employeeId: string;
}

export default function BenefitsTab({ employeeId }: BenefitsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDependentDialog, setShowDependentDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBenefitDetails, setSelectedBenefitDetails] = useState<any>(null);
  const [benefitForm, setBenefitForm] = useState({
    type: "",
    plan: "",
    status: "Eligible",
    enrollmentDate: ""
  });
  const [dependentForm, setDependentForm] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
    dateOfBirth: "",
    gender: "",
    ssn: "",
    isStudent: false
  });

  const { data: benefits = [], isLoading } = useQuery<Benefit[]>({
    queryKey: ["/api/employees", employeeId, "benefits"],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/benefits`);
      if (!response.ok) {
        throw new Error('Failed to fetch benefits');
      }
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: dependents = [], isLoading: isDependentsLoading } = useQuery<Dependent[]>({
    queryKey: ["/api/employees", employeeId, "dependents"],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/dependents`);
      if (!response.ok) {
        throw new Error('Failed to fetch dependents');
      }
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const createBenefitMutation = useMutation({
    mutationFn: async (data: InsertBenefit) => {
      console.log('Creating benefit with data:', data);
      const response = await fetch(`/api/employees/${employeeId}/benefits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Benefit creation failed:', errorText);
        throw new Error('Failed to add benefit');
      }
      
      const result = await response.json();
      console.log('Benefit created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Benefit creation success callback:', data);
      // Force refetch the benefits data
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "benefits"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "benefits"] });
      setShowAddDialog(false);
      setBenefitForm({ type: "", plan: "", status: "Eligible", enrollmentDate: "" });
      toast({ title: "Success", description: "Benefit enrolled successfully" });
    },
    onError: (error) => {
      console.error('Benefit creation error:', error);
      toast({ title: "Error", description: "Failed to enroll in benefit", variant: "destructive" });
    },
  });

  const deleteBenefitMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting benefit with id:', id);
      const response = await fetch(`/api/benefits/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Benefit deletion failed:', errorText);
        throw new Error('Failed to delete benefit');
      }
      
      console.log('Benefit deleted successfully');
    },
    onSuccess: () => {
      console.log('Benefit deletion success callback');
      // Force refetch the benefits data
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "benefits"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "benefits"] });
      toast({ title: "Success", description: "Benefit enrollment removed successfully" });
    },
    onError: (error) => {
      console.error('Benefit deletion error:', error);
      toast({ title: "Error", description: "Failed to remove benefit enrollment", variant: "destructive" });
    },
  });

  const createDependentMutation = useMutation({
    mutationFn: async (data: InsertDependent) => {
      console.log('Creating dependent with data:', data);
      const response = await fetch(`/api/employees/${employeeId}/dependents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dependent creation failed:', errorText);
        throw new Error('Failed to add dependent');
      }
      
      const result = await response.json();
      console.log('Dependent created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Dependent creation success callback:', data);
      // Force refetch the dependents data
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "dependents"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "dependents"] });
      setShowDependentDialog(false);
      setDependentForm({
        firstName: "",
        lastName: "",
        relationship: "",
        dateOfBirth: "",
        gender: "",
        ssn: "",
        isStudent: false
      });
      toast({ title: "Success", description: "Dependent added successfully" });
    },
    onError: (error) => {
      console.error('Dependent creation error:', error);
      toast({ title: "Error", description: "Failed to add dependent", variant: "destructive" });
    },
  });

  const deleteDependentMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting dependent with id:', id);
      const response = await fetch(`/api/dependents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dependent deletion failed:', errorText);
        throw new Error('Failed to delete dependent');
      }
      
      console.log('Dependent deleted successfully');
    },
    onSuccess: () => {
      console.log('Dependent deletion success callback');
      // Force refetch the dependents data
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "dependents"] });
      queryClient.refetchQueries({ queryKey: ["/api/employees", employeeId, "dependents"] });
      toast({ title: "Success", description: "Dependent removed successfully" });
    },
    onError: (error) => {
      console.error('Dependent deletion error:', error);
      toast({ title: "Error", description: "Failed to remove dependent", variant: "destructive" });
    },
  });

  const handleAddBenefit = () => {
    if (!benefitForm.type || !benefitForm.plan) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createBenefitMutation.mutate({
      employeeId,
      type: benefitForm.type,
      plan: benefitForm.plan,
      status: benefitForm.status,
      enrollmentDate: benefitForm.enrollmentDate || new Date().toISOString().split('T')[0],
    });
  };

  const handleAddDependent = () => {
    if (!dependentForm.firstName || !dependentForm.lastName || !dependentForm.relationship || !dependentForm.dateOfBirth) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createDependentMutation.mutate({
      employeeId,
      firstName: dependentForm.firstName,
      lastName: dependentForm.lastName,
      relationship: dependentForm.relationship,
      dateOfBirth: dependentForm.dateOfBirth,
      gender: dependentForm.gender || undefined,
      ssn: dependentForm.ssn || undefined,
      isStudent: dependentForm.isStudent || undefined,
    });
  };

  const benefitTypes = [
    {
      type: "Health Insurance",
      plans: [
        { 
          name: "High Deductible Health Plan (HDHP)", 
          status: "Eligible", 
          cost: "$245/month",
          details: {
            coverage: "Comprehensive medical coverage with high deductible",
            deductible: "$3,000 individual / $6,000 family",
            outOfPocketMax: "$7,000 individual / $14,000 family",
            coinsurance: "80% after deductible",
            primaryCare: "$40 copay after deductible",
            specialistCare: "$80 copay after deductible",
            prescriptions: "Generic: $15, Brand: $45, Specialty: 25%",
            network: "Nationwide PPO network with 90,000+ providers",
            features: [
              "HSA eligible with $1,000 company contribution",
              "Telehealth services included",
              "Preventive care covered 100%",
              "24/7 nurse hotline",
              "Wellness program discounts"
            ]
          }
        },
        { 
          name: "PPO Health Plan", 
          status: "Eligible", 
          cost: "$380/month",
          details: {
            coverage: "Premium PPO plan with low deductibles",
            deductible: "$500 individual / $1,000 family",
            outOfPocketMax: "$4,000 individual / $8,000 family",
            coinsurance: "90% after deductible",
            primaryCare: "$25 copay",
            specialistCare: "$50 copay",
            prescriptions: "Generic: $10, Brand: $30, Specialty: 20%",
            network: "Large PPO network with out-of-network options",
            features: [
              "No referrals needed for specialists",
              "Out-of-network coverage available",
              "Comprehensive maternity coverage",
              "Mental health parity",
              "International coverage for emergencies"
            ]
          }
        },
        { 
          name: "HMO Health Plan", 
          status: "Eligible", 
          cost: "$320/month",
          details: {
            coverage: "Managed care with coordinated health services",
            deductible: "$1,000 individual / $2,000 family",
            outOfPocketMax: "$5,000 individual / $10,000 family",
            coinsurance: "85% after deductible",
            primaryCare: "$20 copay",
            specialistCare: "$40 copay (referral required)",
            prescriptions: "Generic: $10, Brand: $35, Specialty: 25%",
            network: "Regional HMO network",
            features: [
              "Primary care physician coordination",
              "Integrated care management",
              "Preventive care focus",
              "Case management for chronic conditions",
              "Prescription home delivery"
            ]
          }
        },
      ],
      icon: Stethoscope,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      description: "Comprehensive medical coverage including preventive care, prescriptions, and emergency services"
    },
    {
      type: "Dental Insurance",
      plans: [
        { 
          name: "Basic Dental Plan", 
          status: "Eligible", 
          cost: "$28/month",
          details: {
            coverage: "Essential dental care coverage",
            deductible: "$50 individual / $150 family",
            annualMaximum: "$1,500 per person",
            preventiveCare: "100% covered (cleanings, exams, X-rays)",
            basicServices: "80% covered (fillings, extractions)",
            majorServices: "50% covered (crowns, bridges)",
            orthodontics: "Not covered",
            network: "National dental network with 95,000+ dentists",
            features: [
              "No waiting period for preventive care",
              "6-month waiting for basic services",
              "12-month waiting for major services",
              "Online provider directory",
              "Mobile app for claims"
            ]
          }
        },
        { 
          name: "Premium Dental Plan", 
          status: "Eligible", 
          cost: "$45/month",
          details: {
            coverage: "Comprehensive dental care with orthodontics",
            deductible: "$25 individual / $75 family",
            annualMaximum: "$2,500 per person",
            preventiveCare: "100% covered",
            basicServices: "90% covered",
            majorServices: "70% covered",
            orthodontics: "50% covered (lifetime max $2,000)",
            network: "Extensive national network",
            features: [
              "No waiting periods",
              "Adult and child orthodontics",
              "Teeth whitening benefit",
              "TMJ treatment coverage",
              "Emergency dental services"
            ]
          }
        },
      ],
      icon: Heart,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Dental care including cleanings, fillings, and major dental work"
    },
    {
      type: "Vision Insurance",
      plans: [
        { 
          name: "Standard Vision Plan", 
          status: "Eligible", 
          cost: "$12/month",
          details: {
            coverage: "Comprehensive eye care and eyewear benefits",
            eyeExam: "100% covered annually",
            frames: "$200 allowance every 2 years",
            lenses: "100% covered annually",
            contacts: "$200 allowance annually (in lieu of glasses)",
            sunglasses: "20% discount on prescription sunglasses",
            laserSurgery: "15% discount on LASIK/PRK",
            network: "National vision network including LensCrafters, Target Optical",
            features: [
              "Online eyewear ordering",
              "Progressive lens upgrade",
              "Anti-reflective coating included",
              "Blue light filtering option",
              "Pediatric vision care"
            ]
          }
        },
      ],
      icon: Eye,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Eye care coverage including exams, glasses, and contact lenses"
    },
    {
      type: "Life Insurance",
      plans: [
        { 
          name: "Basic Life Insurance", 
          status: "Eligible", 
          cost: "Company Paid",
          details: {
            coverage: "Basic term life insurance provided by company",
            benefitAmount: "1x annual salary (minimum $50,000, maximum $500,000)",
            premiums: "100% company paid",
            eligibility: "All full-time employees",
            beneficiaryOptions: "Primary and contingent beneficiaries",
            portability: "Conversion option available upon termination",
            additionalBenefits: "Accelerated death benefit for terminal illness",
            features: [
              "No medical exam required",
              "Coverage effective from hire date",
              "Automatic beneficiary updates",
              "Travel accident coverage included",
              "Grief counseling services"
            ]
          }
        },
        { 
          name: "Supplemental Life Insurance", 
          status: "Eligible", 
          cost: "$15/month",
          details: {
            coverage: "Additional voluntary term life insurance",
            benefitAmount: "1x to 8x annual salary (maximum $2,000,000)",
            premiums: "Employee paid via payroll deduction",
            underwriting: "Simplified issue up to $500,000",
            spouseCoverage: "Available up to $500,000",
            childCoverage: "Available up to $25,000",
            portability: "Portable upon termination",
            features: [
              "Guaranteed issue amount available",
              "Age-banded premium rates",
              "Annual open enrollment changes",
              "Online beneficiary management",
              "Will preparation services"
            ]
          }
        },
      ],
      icon: Shield,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      description: "Life insurance coverage for financial protection"
    },
    {
      type: "Retirement",
      plans: [
        { 
          name: "401(k) Plan with Company Match", 
          status: "Eligible", 
          cost: "6% match",
          details: {
            coverage: "Tax-advantaged retirement savings plan",
            employeeContribution: "Up to 100% of salary (IRS limits apply)",
            companyMatch: "100% match on first 3%, 50% match on next 3%",
            vestingSchedule: "Immediate vesting on all contributions",
            investmentOptions: "25+ mutual funds and target-date funds",
            loans: "Available up to 50% of vested balance",
            withdrawals: "Hardship withdrawals permitted",
            features: [
              "Automatic enrollment at 6%",
              "Annual auto-increase feature",
              "Roth 401(k) option available",
              "Online account management",
              "Financial planning tools",
              "Rollover assistance"
            ]
          }
        },
      ],
      icon: DollarSign,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Retirement savings with company matching contributions"
    },
    {
      type: "Disability Insurance",
      plans: [
        { 
          name: "Short-term Disability", 
          status: "Eligible", 
          cost: "Company Paid",
          details: {
            coverage: "Income protection for short-term disabilities",
            benefitAmount: "60% of weekly earnings",
            maximumBenefit: "$2,000 per week",
            benefitPeriod: "Up to 26 weeks",
            eliminationPeriod: "7 days for illness, 0 days for accident",
            eligibility: "All full-time employees after 30 days",
            premiums: "100% company paid",
            features: [
              "Maternity leave coverage",
              "Mental health coverage",
              "Return-to-work assistance",
              "Partial disability benefits",
              "Rehabilitation services"
            ]
          }
        },
        { 
          name: "Long-term Disability", 
          status: "Eligible", 
          cost: "Company Paid",
          details: {
            coverage: "Income protection for long-term disabilities",
            benefitAmount: "60% of monthly earnings",
            maximumBenefit: "$8,000 per month",
            benefitPeriod: "To age 65 or Social Security Normal Retirement Age",
            eliminationPeriod: "180 days",
            eligibility: "All full-time employees after 30 days",
            premiums: "100% company paid",
            features: [
              "Own occupation coverage for 24 months",
              "Residual benefits available",
              "Social Security offset",
              "Vocational rehabilitation",
              "Family care benefit"
            ]
          }
        },
      ],
      icon: Briefcase,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Income protection in case of illness or injury"
    },
    {
      type: "Flexible Spending",
      plans: [
        { 
          name: "Healthcare FSA", 
          status: "Eligible", 
          cost: "$0",
          details: {
            coverage: "Pre-tax savings for healthcare expenses",
            annualMaximum: "$3,200 (2025 IRS limit)",
            eligibleExpenses: "Medical, dental, vision deductibles and copays",
            claimSubmission: "Online portal, mobile app, or mail",
            paymentOptions: "Debit card and direct reimbursement",
            carryover: "$640 maximum carryover to next year",
            runoutPeriod: "2.5 months to submit claims",
            features: [
              "Immediate access to full annual election",
              "Automatic substantiation for many expenses",
              "Dependent care also available",
              "Online expense management",
              "Mobile receipt capture"
            ]
          }
        },
        { 
          name: "Dependent Care FSA", 
          status: "Eligible", 
          cost: "$0",
          details: {
            coverage: "Pre-tax savings for dependent care expenses",
            annualMaximum: "$5,000 per household",
            eligibleExpenses: "Daycare, after-school care, summer camps",
            ageLimit: "Children under 13 or disabled dependents",
            claimSubmission: "Online portal with receipt upload",
            paymentOptions: "Direct reimbursement only",
            useItOrLoseIt: "No carryover allowed",
            features: [
              "Backup child care services",
              "Elder care referral services",
              "Online provider directory",
              "Automatic recurring claims",
              "Year-end spending reminders"
            ]
          }
        },
      ],
      icon: Car,
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
      description: "Pre-tax savings for healthcare and dependent care expenses"
    },
    {
      type: "Additional Benefits",
      plans: [
        { 
          name: "Employee Assistance Program", 
          status: "Eligible", 
          cost: "Company Paid",
          details: {
            coverage: "Confidential counseling and support services",
            counselingSessions: "Up to 8 sessions per issue per year",
            serviceTypes: "Personal, family, financial, legal counseling",
            availability: "24/7 phone support",
            familyCoverage: "Includes spouse and dependents",
            onlineResources: "Mental health apps and self-help tools",
            workLifeBalance: "Childcare and eldercare referrals",
            features: [
              "Stress management workshops",
              "Financial planning consultations",
              "Legal consultation services",
              "Manager consultation available",
              "Critical incident response"
            ]
          }
        },
        { 
          name: "Wellness Program", 
          status: "Eligible", 
          cost: "Company Paid",
          details: {
            coverage: "Comprehensive wellness and preventive health program",
            healthScreenings: "Annual biometric screenings",
            incentives: "Up to $500 annual wellness credits",
            challenges: "Monthly fitness and nutrition challenges",
            onSiteServices: "Flu shots, health fairs",
            digitalPlatform: "Wellness app with tracking tools",
            resources: "Nutrition counseling, fitness classes",
            features: [
              "Gym membership discounts",
              "Smoking cessation programs",
              "Weight management support",
              "Mental health resources",
              "Ergonomic assessments"
            ]
          }
        },
        { 
          name: "Professional Development", 
          status: "Eligible", 
          cost: "$2,000/year",
          details: {
            coverage: "Annual budget for professional growth and education",
            annualAllowance: "$2,000 per employee",
            eligibleExpenses: "Conferences, courses, certifications, books",
            approvalProcess: "Manager pre-approval required",
            reimbursement: "100% reimbursement with receipts",
            rollover: "Up to $500 can roll over to next year",
            additionalBenefits: "Tuition reimbursement for degree programs",
            features: [
              "Online learning platform access",
              "Internal mentorship program",
              "Leadership development tracks",
              "Industry conference attendance",
              "Professional certification support"
            ]
          }
        },
      ],
      icon: Gift,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "Additional perks and wellness benefits"
    },
  ];

  const benefitColumns = [
    { key: "type" as keyof Benefit, header: "Benefit Type" },
    { key: "plan" as keyof Benefit, header: "Plan Name" },
    { 
      key: "status" as keyof Benefit, 
      header: "Status",
      render: (value: string) => (
        <Badge className={getStatusColor(value)} variant="secondary">
          {value}
        </Badge>
      ),
    },
    { 
      key: "enrollmentDate" as keyof Benefit, 
      header: "Enrollment Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "N/A"
    },
  ];

  const dependentColumns = [
    { key: "firstName" as keyof Dependent, header: "First Name" },
    { key: "lastName" as keyof Dependent, header: "Last Name" },
    { key: "relationship" as keyof Dependent, header: "Relationship" },
    { 
      key: "dateOfBirth" as keyof Dependent, 
      header: "Date of Birth",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { key: "gender" as keyof Dependent, header: "Gender" },
    { 
      key: "isStudent" as keyof Dependent, 
      header: "Student",
      render: (value: boolean | null) => value ? "Yes" : "No"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enrolled":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
      case "Eligible":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Declined":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const handleViewDetails = (benefitType: any, plan: any, currentStatus: string) => {
    setSelectedBenefitDetails({
      type: benefitType.type,
      plan: plan.name,
      cost: plan.cost,
      status: currentStatus,
      details: plan.details,
      icon: benefitType.icon,
      iconColor: benefitType.iconColor,
      bgColor: benefitType.bgColor
    });
    setShowDetailsDialog(true);
  };

  if (isLoading || isDependentsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled Plans</p>
                <p className="text-2xl font-bold text-green-600">
                  {benefits.filter(b => b.status === "Enrolled").length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Plans</p>
                <p className="text-2xl font-bold text-blue-600">
                  {benefitTypes.reduce((acc, type) => acc + type.plans.length, 0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Enrollment</p>
                <p className="text-sm font-semibold text-orange-600">Nov 1-15</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Benefits Value</p>
                <p className="text-2xl font-bold text-purple-600">$15K+</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-primary" />
              Available Benefits
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowAddDialog(true)} 
                size="sm" 
                data-testid="button-add-benefit"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enroll in Benefit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {benefitTypes.map((benefitType) => (
              <div key={benefitType.type} className="space-y-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${benefitType.bgColor} rounded-lg flex items-center justify-center`}>
                    <benefitType.icon className={`h-5 w-5 ${benefitType.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{benefitType.type}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{benefitType.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 ml-13">
                  {benefitType.plans.map((plan, index) => {
                    const enrolledBenefit = benefits.find(b => 
                      b.type === benefitType.type && b.plan === plan.name
                    );
                    const isEnrolled = enrolledBenefit?.status === "Enrolled";
                    const currentStatus = enrolledBenefit?.status || plan.status;
                    
                    return (
                      <div
                        key={`${benefitType.type}-${index}`}
                        className={`border rounded-lg p-4 transition-all duration-200 ${
                          isEnrolled 
                            ? 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800 hover:shadow-md hover:border-green-400 dark:hover:border-green-700' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                        }`}
                        data-testid={`benefit-plan-${benefitType.type}-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{plan.name}</h4>
                              <Badge 
                                className={`${getStatusColor(currentStatus)} text-xs`}
                                variant="secondary"
                              >
                                {currentStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cost: {plan.cost}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!isEnrolled && currentStatus !== "Enrolled" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setBenefitForm({
                                    type: benefitType.type,
                                    plan: plan.name,
                                    status: "Enrolled",
                                    enrollmentDate: new Date().toISOString().split('T')[0]
                                  });
                                  setShowAddDialog(true);
                                }}
                              >
                                Enroll
                              </Button>
                            )}
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-primary hover:text-primary/80"
                              onClick={() => handleViewDetails(benefitType, plan, currentStatus)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dependents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Dependents
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDependentDialog(true)}
              data-testid="button-add-dependent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dependent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isDependentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : dependents.length > 0 ? (
            <DataTable
              columns={dependentColumns}
              data={dependents}
              onDelete={(item) => deleteDependentMutation.mutate(item.id)}
              emptyMessage="No dependents found"
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-medium">No dependents on file</p>
              <p className="text-sm">Add dependents to include them in your benefit coverage</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Current Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {benefits.filter(b => b.status === "Enrolled").length > 0 ? (
            <DataTable
              columns={benefitColumns}
              data={benefits.filter(b => b.status === "Enrolled")}
              onDelete={(item) => deleteBenefitMutation.mutate(item.id)}
              emptyMessage="No current enrollments"
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-medium">No enrollments yet</p>
              <p className="text-sm">Start by enrolling in available benefits above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Benefit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Benefit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="benefit-type">Benefit Type</Label>
              <Select 
                value={benefitForm.type} 
                onValueChange={(value) => setBenefitForm({...benefitForm, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select benefit type" />
                </SelectTrigger>
                <SelectContent>
                  {benefitTypes.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="benefit-plan">Plan</Label>
              <Select 
                value={benefitForm.plan} 
                onValueChange={(value) => setBenefitForm({...benefitForm, plan: value})}
                disabled={!benefitForm.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {benefitForm.type && benefitTypes.find(t => t.type === benefitForm.type)?.plans.map((plan) => (
                    <SelectItem key={plan.name} value={plan.name}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="benefit-status">Status</Label>
              <Select 
                value={benefitForm.status} 
                onValueChange={(value) => setBenefitForm({...benefitForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eligible">Eligible</SelectItem>
                  <SelectItem value="Enrolled">Enrolled</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="enrollment-date">Enrollment Date</Label>
              <Input
                type="date"
                value={benefitForm.enrollmentDate}
                onChange={(e) => setBenefitForm({...benefitForm, enrollmentDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBenefit} disabled={createBenefitMutation.isPending}>
              {createBenefitMutation.isPending ? "Adding..." : "Add Benefit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dependent Dialog */}
      <Dialog open={showDependentDialog} onOpenChange={setShowDependentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Dependent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dependent-first-name">First Name *</Label>
                <Input 
                  id="dependent-first-name"
                  placeholder="Enter first name" 
                  value={dependentForm.firstName}
                  onChange={(e) => setDependentForm({...dependentForm, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="dependent-last-name">Last Name *</Label>
                <Input 
                  id="dependent-last-name"
                  placeholder="Enter last name" 
                  value={dependentForm.lastName}
                  onChange={(e) => setDependentForm({...dependentForm, lastName: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dependent-relationship">Relationship *</Label>
              <Select 
                value={dependentForm.relationship} 
                onValueChange={(value) => setDependentForm({...dependentForm, relationship: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="domestic-partner">Domestic Partner</SelectItem>
                  <SelectItem value="step-child">Step Child</SelectItem>
                  <SelectItem value="adopted-child">Adopted Child</SelectItem>
                  <SelectItem value="foster-child">Foster Child</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dependent-dob">Date of Birth *</Label>
                <Input 
                  id="dependent-dob"
                  type="date" 
                  value={dependentForm.dateOfBirth}
                  onChange={(e) => setDependentForm({...dependentForm, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="dependent-gender">Gender</Label>
                <Select 
                  value={dependentForm.gender} 
                  onValueChange={(value) => setDependentForm({...dependentForm, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dependent-ssn">SSN (optional)</Label>
              <Input 
                id="dependent-ssn"
                placeholder="xxx-xx-xxxx" 
                value={dependentForm.ssn}
                onChange={(e) => setDependentForm({...dependentForm, ssn: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="dependent-student"
                className="h-4 w-4"
                checked={dependentForm.isStudent}
                onChange={(e) => setDependentForm({...dependentForm, isStudent: e.target.checked})}
              />
              <Label htmlFor="dependent-student">Full-time student</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDependentDialog(false);
              setDependentForm({
                firstName: "",
                lastName: "",
                relationship: "",
                dateOfBirth: "",
                gender: "",
                ssn: "",
                isStudent: false
              });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddDependent} 
              disabled={createDependentMutation.isPending}
            >
              {createDependentMutation.isPending ? "Adding..." : "Add Dependent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Benefit Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              {selectedBenefitDetails && (
                <>
                  <div className={`w-10 h-10 ${selectedBenefitDetails.bgColor} rounded-lg flex items-center justify-center`}>
                    <selectedBenefitDetails.icon className={`h-5 w-5 ${selectedBenefitDetails.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedBenefitDetails.plan}</h3>
                    <p className="text-sm text-gray-500">{selectedBenefitDetails.type}</p>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBenefitDetails && (
            <div className="space-y-6">
              {/* Overview Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Monthly Cost</h4>
                    <p className="text-2xl font-bold text-green-600">{selectedBenefitDetails.cost}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Status</h4>
                    <Badge className={`${getStatusColor(selectedBenefitDetails.status)}`} variant="secondary">
                      {selectedBenefitDetails.status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Coverage</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBenefitDetails.details.coverage}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Key Benefits Section */}
              {selectedBenefitDetails.details.deductible && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coverage Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBenefitDetails.details.deductible && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Deductible</h5>
                          <p className="text-gray-600 dark:text-gray-400">{selectedBenefitDetails.details.deductible}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.outOfPocketMax && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Out-of-Pocket Maximum</h5>
                          <p className="text-gray-600 dark:text-gray-400">{selectedBenefitDetails.details.outOfPocketMax}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.coinsurance && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Coinsurance</h5>
                          <p className="text-gray-600 dark:text-gray-400">{selectedBenefitDetails.details.coinsurance}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.primaryCare && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Primary Care</h5>
                          <p className="text-gray-600 dark:text-gray-400">{selectedBenefitDetails.details.primaryCare}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.specialistCare && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Specialist Care</h5>
                          <p className="text-gray-600 dark:text-gray-400">{selectedBenefitDetails.details.specialistCare}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.prescriptions && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Prescriptions</h5>
                          <p className="text-gray-600 dark:text-gray-400">{selectedBenefitDetails.details.prescriptions}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dental/Vision Specific Details */}
              {(selectedBenefitDetails.details.preventiveCare || selectedBenefitDetails.details.eyeExam) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coverage Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBenefitDetails.details.preventiveCare && (
                        <div>
                          <h5 className="font-medium text-gray-900">Preventive Care</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.preventiveCare}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.basicServices && (
                        <div>
                          <h5 className="font-medium text-gray-900">Basic Services</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.basicServices}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.majorServices && (
                        <div>
                          <h5 className="font-medium text-gray-900">Major Services</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.majorServices}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.orthodontics && (
                        <div>
                          <h5 className="font-medium text-gray-900">Orthodontics</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.orthodontics}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.eyeExam && (
                        <div>
                          <h5 className="font-medium text-gray-900">Eye Exam</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.eyeExam}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.frames && (
                        <div>
                          <h5 className="font-medium text-gray-900">Frames</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.frames}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Life Insurance/Retirement Specific */}
              {(selectedBenefitDetails.details.benefitAmount || selectedBenefitDetails.details.employeeContribution) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBenefitDetails.details.benefitAmount && (
                        <div>
                          <h5 className="font-medium text-gray-900">Benefit Amount</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.benefitAmount}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.employeeContribution && (
                        <div>
                          <h5 className="font-medium text-gray-900">Employee Contribution</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.employeeContribution}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.companyMatch && (
                        <div>
                          <h5 className="font-medium text-gray-900">Company Match</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.companyMatch}</p>
                        </div>
                      )}
                      {selectedBenefitDetails.details.vestingSchedule && (
                        <div>
                          <h5 className="font-medium text-gray-900">Vesting Schedule</h5>
                          <p className="text-gray-600">{selectedBenefitDetails.details.vestingSchedule}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Network Information */}
              {selectedBenefitDetails.details.network && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Network & Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{selectedBenefitDetails.details.network}</p>
                  </CardContent>
                </Card>
              )}

              {/* Key Features */}
              {selectedBenefitDetails.details.features && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedBenefitDetails.details.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                {selectedBenefitDetails.status !== "Enrolled" && (
                  <Button 
                    onClick={() => {
                      setBenefitForm({
                        type: selectedBenefitDetails.type,
                        plan: selectedBenefitDetails.plan,
                        status: "Enrolled",
                        enrollmentDate: new Date().toISOString().split('T')[0]
                      });
                      setShowDetailsDialog(false);
                      setShowAddDialog(true);
                    }}
                  >
                    Enroll in This Plan
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
