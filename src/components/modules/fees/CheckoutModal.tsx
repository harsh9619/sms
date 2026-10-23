import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  User,
  Building2,
  QrCode,
  ShieldCheck,
  Loader2,
  Lock,
  CreditCard,
  Check,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { FeeRecord } from "../../../types";
import paymentGatewayService, {
  PublicPaymentConfig,
} from "../../../Services/paymentGateway.service";
import { loadRazorpayScript } from "../../../utils/razorpay";

interface CheckoutModalProps {
  payingFee: FeeRecord | null;
  setPayingFee: (fee: FeeRecord | null) => void;
  payingFeeItems: any[];
  checkoutTotalAmount: number;
  paymentMethod: string;
  setPaymentMethod?: (method: string) => void;
  processing?: boolean;
  handlePay?: () => void;
  schoolId?: string | number;
  schoolName?: string;
  onPaymentSuccess?: (receiptData: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  payingFee,
  setPayingFee,
  payingFeeItems,
  checkoutTotalAmount,
  paymentMethod,
  setPaymentMethod,
  processing: parentProcessing = false,
  handlePay: parentHandlePay,
  schoolId = "1",
  schoolName: parentSchoolName,
  onPaymentSuccess,
}) => {
  const [gatewayConfig, setGatewayConfig] = useState<PublicPaymentConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Active view or selected payment channel
  const [selectedChannel, setSelectedChannel] = useState<
    "overview" | "bharat_qr" | "neft_rtgs" | "wallets" | "upi_gpay" | "upi_phonepe" | "upi_paytm" | "upi_other" | "netbanking" | "cards"
  >("overview");

  // Dynamic Contact Info (phone & email) with inline edit capability
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempEmail, setTempEmail] = useState(email);

  // Countdown timer: 14:55 (895 seconds) matching the image
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(895);

  // Netbanking selection state
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Card form state
  const [cardNumber, setCardNumber] = useState("4111 •••• •••• 4444");
  const [cardExp, setCardExp] = useState("12/30");
  const [cardCvv, setCardCvv] = useState("123");

  // UPI VPA state
  const [upiId, setUpiId] = useState("student@okhdfcbank");

  const isProcessing = parentProcessing || localProcessing;

  // Initialize dynamic contact from paying fee
  useEffect(() => {
    if (payingFee) {
      debugger
      const studentName =
        (payingFee as any).studentName ||
        (payingFee as any).name ||
        "";
      const studentPhone =
        (payingFee as any).phone ||
        (payingFee as any).parentPhone ||
        (payingFee as any).parent_phone ||
        "";
      const studentEmail =
        (payingFee as any).email ||
        (payingFee as any).parentEmail ||
        (payingFee as any).parent_email;

      setName(studentName);

      setPhone(studentPhone);
      setEmail(studentEmail);
      setTempPhone(studentPhone);
      setTempEmail(studentEmail);
    }
  }, [payingFee]);

  // Session timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format timer as MM:SS
  const formatTimer = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Fetch school's payment gateway configuration
  useEffect(() => {
    if (!payingFee) return;
    let isMounted = true;
    setConfigLoading(true);

    const activeSchoolId = schoolId || (payingFee as any).schoolId || "1";
    paymentGatewayService
      .getPublicConfig(activeSchoolId)
      .then((cfg) => {
        if (isMounted) setGatewayConfig(cfg);
      })
      .catch((err) => {
        console.warn("Could not fetch school gateway config, using defaults", err);
        if (isMounted) {
          setGatewayConfig({
            schoolId: Number(activeSchoolId),
            schoolName: parentSchoolName || "EXPERTS INTERNATIONAL HIGH SCHOOL AND JUNIOR COLLEGE",
            currency: "INR",
            enabled: true,
            testMode: true,
            keyId: "rzp_test_school_dummy_key",
            isDummyCredential: true,
            testModeNotice: "No real payment will be deducted when you use Razorpay Test Mode",
          });
        }
      })
      .finally(() => {
        if (isMounted) setConfigLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [payingFee, schoolId, parentSchoolName]);

  if (!payingFee) return null;

  const currentSchoolId = schoolId || (payingFee as any).schoolId || "1";
  const effectiveSchoolName = (
    gatewayConfig?.schoolName ||
    parentSchoolName ||
    "EXPERTS INTERNATIONAL HIGH SCHOOL AND JUNIOR COLLEGE"
  ).toUpperCase();
  const isTestMode = gatewayConfig ? gatewayConfig.testMode : true;

  /**
   * Complete payment verification with backend
   */
  const executeVerification = async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    methodUsed: string;
  }) => {
    setStatusMessage("Verifying signature with school backend...");
    const feeIds = payingFeeItems.map((item) => item.id);

    const verifyResult = await paymentGatewayService.verifyPayment(currentSchoolId, {
      razorpayOrderId: payload.razorpayOrderId,
      razorpayPaymentId: payload.razorpayPaymentId,
      razorpaySignature: payload.razorpaySignature,
      studentId: payingFee.studentId,
      feeIds,
      remarks: `Paid via Payment Gateway (${payload.methodUsed.toUpperCase()}) | School ID: ${currentSchoolId}`,
    });

    setStatusMessage("Payment authorized! Generating digital receipt...");
    setTimeout(() => {
      setLocalProcessing(false);
      if (onPaymentSuccess) {
        onPaymentSuccess(verifyResult);
      } else if (parentHandlePay) {
        parentHandlePay();
      }
    }, 700);
  };

  /**
   * Process payment for the chosen channel
   */
  const handleInitiatePayment = async (channelName: string) => {
    try {
      setLocalProcessing(true);
      setStatusMessage(`Initiating ${channelName.toUpperCase()} Payment...`);

      const feeIds = payingFeeItems.map((item) => item.id);
      const order = await paymentGatewayService.createOrder(currentSchoolId, {
        studentId: payingFee.studentId,
        feeIds,
        amount: checkoutTotalAmount,
        notes: {
          studentName: payingFee.studentName || "Student",
          class: payingFee.class || "N/A",
          month: payingFee.month || "Current",
          paymentMethod: channelName,
          phone,
          email,
        },
      });

      const assignedOrderId = order.orderId || `order_test_${Date.now()}`;

      // Official Razorpay Script invocation if live credentials exist
      const isOfficialKey =
        order.keyId &&
        order.keyId.startsWith("rzp_") &&
        !order.keyId.includes("dummy") &&
        !order.keyId.startsWith("rzp_test_school");

      if (isOfficialKey && typeof window !== "undefined") {
        setStatusMessage("Opening Payment Gateway...");
        const sdkLoaded = await loadRazorpayScript();

        if (sdkLoaded && (window as any).Razorpay) {
          const options = {
            key: order.keyId,
            amount: order.amount,
            currency: order.currency || "INR",
            name: effectiveSchoolName,
            description: `Fee Payment - ${payingFee.studentName} (${payingFee.month || "Current"})`,
            order_id: assignedOrderId,
            prefill: {
              name: payingFee.studentName || "Student Name",
              email: email.toLowerCase(),
              contact: phone,
              method: channelName.includes("upi") ? "upi" : channelName,
            },
            theme: { color: "#3B1864" },
            modal: {
              ondismiss: () => {
                setLocalProcessing(false);
                setStatusMessage("");
              },
            },
            handler: async (response: any) => {
              try {
                await executeVerification({
                  razorpayOrderId: response.razorpay_order_id || assignedOrderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  methodUsed: channelName,
                });
              } catch (err: any) {
                console.error("Verification error:", err);
                alert("Payment verification failed: " + (err?.message || "Unknown error"));
                setLocalProcessing(false);
              }
            },
          };

          const rzpInstance = new (window as any).Razorpay(options);
          rzpInstance.open();
          setLocalProcessing(false);
          return;
        }
      }

      // Seamless Instant Sandbox Gateway Authorization
      setStatusMessage("Simulating Bank Gateway Authorization...");
      await new Promise((res) => setTimeout(res, 600));

      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const testPaymentId = `pay_test_${randomSuffix}`;
      const testSignature = `test_sig_${assignedOrderId}_${randomSuffix}`;

      setStatusMessage("Verifying OTP / Payment Confirmation...");
      await new Promise((res) => setTimeout(res, 600));

      await executeVerification({
        razorpayOrderId: assignedOrderId,
        razorpayPaymentId: testPaymentId,
        razorpaySignature: testSignature,
        methodUsed: channelName,
      });
    } catch (err: any) {
      console.error("Payment error:", err);
      alert("Payment failed: " + (err?.message || "Unknown error"));
      setLocalProcessing(false);
    }
  };

  const handleSaveContact = () => {
    setPhone(tempPhone);
    setEmail(tempEmail.toUpperCase());
    setIsEditingContact(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-2 sm:p-4 overflow-y-auto"
      onClick={() => !isProcessing && setPayingFee(null)}
    >
      {/* ========================================================= */}
      {/* MOBILE PAYMENT GATEWAY CONTAINER (PURPLE BACKGROUND) */}
      {/* ========================================================= */}
      <div
        className="w-full max-w-[420px] sm:max-w-[440px] bg-[#3B1864] text-white rounded-[28px] sm:rounded-[34px] shadow-2xl overflow-hidden flex flex-col relative animate-scale-in text-left my-auto border border-purple-900/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP STATUS BAR & HEADER NAVIGATION */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between text-white/90 mb-3">
            <button
              type="button"
              onClick={() => {
                if (selectedChannel !== "overview") {
                  setSelectedChannel("overview");
                } else if (!isProcessing) {
                  setPayingFee(null);
                }
              }}
              className="p-1 -ml-1 text-white hover:text-white/80 transition-colors"
              title="Back"
            >
              <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => !isProcessing && setPayingFee(null)}
              className="p-1 -mr-1 text-white hover:text-white/80 transition-colors"
              title="Close"
            >
              <X className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* DYNAMIC SCHOOL / MERCHANT NAME */}
          <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide leading-tight text-white/95 line-clamp-2">
            {effectiveSchoolName}
          </h1>

          {/* DYNAMIC AMOUNT */}
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ₹ {checkoutTotalAmount.toLocaleString("en-IN")}
            </span>

            {/* EXPIRY TIMER */}
            <span className="text-[11px] font-medium text-purple-200/90 whitespace-nowrap">
              Session expires in {formatTimer(timeLeftSeconds)}
            </span>
          </div>

          {/* Breakdown Toggle */}
          <button
            type="button"
            onClick={() => setShowOrderSummary(!showOrderSummary)}
            className="mt-2 text-[11px] text-purple-200/80 hover:text-white flex items-center gap-1 font-semibold"
          >
            <span>{showOrderSummary ? "Hide Fee Items" : "View Fee Breakdown"}</span>
            {showOrderSummary ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showOrderSummary && (
            <div className="mt-2 p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/20 text-xs space-y-1.5 animate-fade-in">
              {payingFeeItems.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center text-purple-100">
                  <span className="capitalize">{item.feeType || item.type || "Tuition"} Fee</span>
                  <span className="font-mono font-bold">₹{Number(item.amount || 0).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* WHITE FLOATING CARD CONTAINER */}
        {/* ========================================================= */}
        <div className="bg-white text-slate-900 rounded-[24px] sm:rounded-[28px] mx-3 sm:mx-4 p-4 shadow-xl flex flex-col space-y-3.5 relative overflow-hidden">
          {/* USER CONTACT PROFILE CARD WITH EDIT CAPABILITY */}
          <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 bg-white shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* User Avatar Circle */}
              <div className="h-10 w-10 rounded-full bg-slate-950 flex items-center justify-center text-white shrink-0">
                <User className="h-5 w-5 stroke-[2.2]" />
              </div>

              {isEditingContact ? (
                <div className="space-y-1.5 min-w-0 flex-1">
                  <input
                    type="text"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-900"
                    placeholder="Phone Number"
                  />
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-800"
                    placeholder="Email"
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950 tracking-wide font-mono leading-tight">
                    {name}
                  </p>
                  <p className="text-sm font-bold text-slate-950 tracking-wide font-mono leading-tight">
                    {phone}
                  </p>
                  <p className="text-[11px] font-bold text-slate-600 truncate uppercase mt-0.5 max-w-[190px] sm:max-w-[220px]">
                    {email}
                  </p>
                </div>
              )}
            </div>

            {isEditingContact ? (
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase"
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="text-[10px] font-medium text-slate-400 hover:text-slate-600 uppercase"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingContact(true)}
                className="text-xs font-bold text-[#0082FB] hover:text-blue-700 uppercase tracking-wider shrink-0 transition-colors"
              >
                EDIT
              </button>
            )}
          </div>

          {/* ========================================================= */}
          {/* PAYMENT METHODS ACCORDION & LIST */}
          {/* ========================================================= */}

          {/* 1. BHARAT QR */}
          <div className="border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setSelectedChannel(selectedChannel === "bharat_qr" ? "overview" : "bharat_qr")}
              className="w-full flex flex-col items-start text-left group"
            >
              <span className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                Bharat QR
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                {/* Bharat QR Badge */}
                <div className="border border-slate-300 rounded px-1.5 py-0.5 flex items-center gap-1 bg-slate-50">
                  <span className="text-[9px] font-black tracking-tight text-slate-700">BHARAT QR</span>
                  <span className="text-[10px] font-bold text-purple-700">₹</span>
                </div>
              </div>
            </button>

            {/* Expandable Bharat QR View */}
            {selectedChannel === "bharat_qr" && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2 animate-fade-in">
                <div className="h-32 w-32 mx-auto bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                  <QrCode className="h-28 w-28 text-slate-900" />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  Scan & Pay ₹{checkoutTotalAmount.toLocaleString("en-IN")}
                </p>
                <button
                  type="button"
                  onClick={() => handleInitiatePayment("Bharat QR")}
                  disabled={isProcessing}
                  className="w-full h-9 rounded-xl bg-[#3B1864] hover:bg-[#4E2084] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                  <span>Authorize Bharat QR Payment</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. NEFT/RTGS */}
          <div className="border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setSelectedChannel(selectedChannel === "neft_rtgs" ? "overview" : "neft_rtgs")}
              className="w-full flex flex-col items-start text-left group"
            >
              <span className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                NEFT/RTGS
              </span>
              <div className="mt-1 flex items-center gap-1">
                <Building2 className="h-5 w-5 text-[#0082FB]" />
              </div>
            </button>

            {/* Expandable NEFT/RTGS View */}
            {selectedChannel === "neft_rtgs" && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs animate-fade-in">
                <p className="text-[10px] uppercase font-bold text-slate-500">Virtual Bank Account</p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                  <p><strong>A/C Name:</strong> {effectiveSchoolName.slice(0, 30)}</p>
                  <p><strong>A/C No:</strong> 99202400{payingFee.studentId || "101"}</p>
                  <p><strong>IFSC:</strong> HDFC0000240</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInitiatePayment("NEFT/RTGS")}
                  disabled={isProcessing}
                  className="w-full h-9 rounded-xl bg-[#3B1864] hover:bg-[#4E2084] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Confirm NEFT Transfer (Test)</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. WALLETS */}
          <div className="border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setSelectedChannel(selectedChannel === "wallets" ? "overview" : "wallets")}
              className="w-full flex flex-col items-start text-left group"
            >
              <span className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                Wallets
              </span>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                {/* PhonePe Purple Circle Icon */}
                <div className="h-4 w-4 rounded-full bg-[#5F259F] text-white flex items-center justify-center text-[9px] font-black">
                  पे
                </div>
                {/* Paytm Cyan/Navy text badge */}
                <span className="font-black text-[11px] text-[#002E6E] tracking-tight">
                  pay<span className="text-[#00B9F5]">tm</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">and other wallets</span>
              </div>
            </button>

            {/* Expandable Wallets View */}
            {selectedChannel === "wallets" && (
              <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-in">
                {[
                  { id: "paytm", label: "Paytm Wallet" },
                  { id: "phonepe", label: "PhonePe Wallet" },
                  { id: "amazon", label: "Amazon Pay" },
                  { id: "mobikwik", label: "MobiKwik" },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleInitiatePayment(w.label)}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 text-xs font-bold text-slate-800 text-left transition-colors"
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. UPI MOBILE APPS */}
          <div className="border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-900 text-sm block mb-2">
              UPI Mobile Apps
            </span>

            {/* Horizontal Row of 4 UPI Tiles */}
            <div className="grid grid-cols-4 gap-2">
              {/* GOOGLE PAY TILE */}
              <button
                type="button"
                onClick={() => handleInitiatePayment("Google Pay")}
                disabled={isProcessing}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
              >
                <div className="h-8 w-8 flex items-center justify-center">
                  {/* Google Pay Logo */}
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-slate-700 truncate w-full">
                  Google Pay
                </span>
              </button>

              {/* PHONEPE TILE */}
              <button
                type="button"
                onClick={() => handleInitiatePayment("PhonePe")}
                disabled={isProcessing}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
              >
                <div className="h-8 w-8 flex items-center justify-center">
                  <div className="h-7 w-7 rounded-full bg-[#5F259F] text-white flex items-center justify-center text-xs font-black shadow-xs">
                    पे
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-700 truncate w-full">
                  PhonePe
                </span>
              </button>

              {/* PAYTM TILE */}
              <button
                type="button"
                onClick={() => handleInitiatePayment("Paytm")}
                disabled={isProcessing}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
              >
                <div className="h-8 w-8 flex items-center justify-center">
                  <span className="font-black text-xs text-[#002E6E] tracking-tighter">
                    pay<span className="text-[#00B9F5]">tm</span>
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-700 truncate w-full">
                  Paytm
                </span>
              </button>

              {/* OTHER UPI TILE */}
              <button
                type="button"
                onClick={() => setSelectedChannel(selectedChannel === "upi_other" ? "overview" : "upi_other")}
                disabled={isProcessing}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
              >
                <div className="h-8 w-8 flex items-center justify-center">
                  {/* Tricolor UPI icon */}
                  <div className="h-6 w-6 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-6 w-6">
                      <polygon points="12,2 2,12 12,22" fill="#F47B20" opacity="0.9" />
                      <polygon points="22,12 12,2 12,22" fill="#0F753A" opacity="0.9" />
                    </svg>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-700 truncate w-full">
                  Other
                </span>
              </button>
            </div>

            {/* Other UPI handle input drawer */}
            {selectedChannel === "upi_other" && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 animate-fade-in">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Enter Any UPI ID / VPA
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-1 h-9 px-2.5 rounded-lg border border-slate-300 font-mono text-xs font-bold outline-none focus:ring-1 focus:ring-purple-600"
                    placeholder="name@okhdfcbank"
                  />
                  <button
                    type="button"
                    onClick={() => handleInitiatePayment("UPI VPA")}
                    disabled={isProcessing}
                    className="px-3 h-9 rounded-lg bg-[#3B1864] text-white font-bold text-xs"
                  >
                    Pay
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. NET BANKING */}
          <div className="border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setSelectedChannel(selectedChannel === "netbanking" ? "overview" : "netbanking")}
              className="w-full flex flex-col items-start text-left group"
            >
              <span className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                Net Banking
              </span>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                {/* Axis maroon logo */}
                <div className="h-4 w-4 bg-[#97144D] rounded-xs flex items-center justify-center text-white text-[8px] font-bold">
                  ▲
                </div>
                {/* HDFC red/blue square */}
                <div className="h-4 w-4 border-2 border-[#004C8F] flex items-center justify-center">
                  <div className="h-1.5 w-1.5 bg-[#ED1C24]" />
                </div>
                {/* ICICI / SBI round logo */}
                <div className="h-4 w-4 rounded-full bg-[#00B5EF] flex items-center justify-center text-white text-[8px] font-bold">
                  ●
                </div>
                <span className="text-[11px] text-slate-400 font-medium">59+ other banks</span>
              </div>
            </button>

            {/* Expandable NetBanking Bank Selection Grid */}
            {selectedChannel === "netbanking" && (
              <div className="mt-3 space-y-2 animate-fade-in">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "HDFC", name: "HDFC Bank" },
                    { id: "SBI", name: "SBI" },
                    { id: "ICICI", name: "ICICI Bank" },
                    { id: "AXIS", name: "Axis Bank" },
                    { id: "KOTAK", name: "Kotak" },
                    { id: "PNB", name: "PNB" },
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => handleInitiatePayment(`NetBanking (${bank.name})`)}
                      disabled={isProcessing}
                      className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-center text-xs font-bold text-slate-800 transition-colors"
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. CREDIT / DEBIT CARDS */}
          <div>
            <button
              type="button"
              onClick={() => setSelectedChannel(selectedChannel === "cards" ? "overview" : "cards")}
              className="w-full flex flex-col items-start text-left group"
            >
              <span className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                Cards (Credit / Debit)
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <CreditCard className="h-4 w-4 text-slate-600" />
                <span className="text-[11px] text-slate-400 font-medium">Visa, Mastercard, RuPay</span>
              </div>
            </button>

            {/* Expandable Cards View */}
            {selectedChannel === "cards" && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fade-in text-xs">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono text-xs font-bold bg-white"
                  placeholder="Card Number"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-300 font-mono text-xs font-bold bg-white"
                    placeholder="MM/YY"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-300 font-mono text-xs font-bold bg-white"
                    placeholder="CVV"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleInitiatePayment("Credit/Debit Card")}
                  disabled={isProcessing}
                  className="w-full h-9 rounded-xl bg-[#3B1864] hover:bg-[#4E2084] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 mt-1"
                >
                  {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                  <span>Pay ₹{checkoutTotalAmount.toLocaleString("en-IN")}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM BRANDING & FOOTER (ADAPTIS BY NTT DATA) */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 pt-3 pb-5 flex flex-col items-start">
          {/* Status feedback message when processing */}
          {statusMessage && (
            <div className="mb-3 w-full p-2.5 rounded-xl bg-purple-950/80 border border-purple-400/40 text-purple-100 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Test Mode pill */}
          {isTestMode && (
            <div className="mb-3 w-full py-1 px-2.5 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-200 text-[10px] font-semibold flex items-center justify-between">
              <span>Test Mode: No real charges deducted</span>
              <span className="font-mono bg-amber-400/30 px-1 rounded">Sandbox</span>
            </div>
          )}



        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
