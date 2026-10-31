import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  BadgeCheck,
  FileText,
  Users,
  RefreshCw,
  MapPin,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { SERVICE_LABELS } from '../data/mockData';
import { initiatePayment } from '../services/paymentService';
import type { Worker } from '../types';

interface Props {
  worker: Worker;
  plan: 'weekly' | 'monthly';
  onClose: () => void;
}

export default function SubscriptionWizard({ worker, plan, onClose }: Props) {
  const { addBooking, setContractActive, setContractWorker, currentUser, setView } = useApp();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [step, setStep] = useState(0);

  const isMonthly = plan === 'monthly';
  const totalDays = isMonthly ? 26 : 6; // 26 working days for monthly (4 Sundays off), 6 for weekly

  // Pricing calculations
  const perVisitBase = worker.pricePerVisit || 200;
  const regularTotal = perVisitBase * totalDays;
  const discountPercent = isMonthly ? 0.20 : 0.10;
  const discountedWorkerFee = Math.round(regularTotal * (1 - discountPercent));
  const platformGuaranteeFee = isMonthly ? 49 : 15;
  const totalContractCost = discountedWorkerFee + platformGuaranteeFee;
  const savings = regularTotal - discountedWorkerFee;

  // Step 1: Schedule & Shift
  const [selectedShift, setSelectedShift] = useState<'morning' | 'evening' | 'both'>('morning');
  const [morningTime, setMorningTime] = useState('07:30 AM');
  const [eveningTime, setEveningTime] = useState('06:00 PM');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [restDay, setRestDay] = useState(isHi ? 'रविवार (Sunday)' : 'Sunday');

  // Step 2: Household & Chores
  const [familyMembers, setFamilyMembers] = useState(isHi ? '4 सदस्य' : '4 Members');
  const [rotisCount, setRotisCount] = useState('18');
  const [dietType, setDietType] = useState<'veg' | 'jain' | 'nonveg'>('veg');
  const [includeUtensils, setIncludeUtensils] = useState(true);
  const [includeMopping, setIncludeMopping] = useState(true);
  const [specialInstructions, setSpecialInstructions] = useState(
    isHi
      ? 'भोजन समय पर और कम तेल-मसाले में बनाएं।'
      : 'Punctual arrival, mild spice preference, clean kitchen slab after work.'
  );

  // Step 3: Address
  const [address, setAddress] = useState(`${worker.area}, ${worker.city || 'Agra'}`);
  const [societyName, setSocietyName] = useState('Civil Lines / Green Park Enclave');

  // Step 4: Payment model
  const [paymentMode, setPaymentMode] = useState<'split' | 'full' | 'weekly_cash'>('split');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [contractId, setContractId] = useState('');

  // Shift multiplier for 2 visits/day
  const shiftMultiplier = selectedShift === 'both' ? 1.4 : 1.0;
  const finalTotalAmount = Math.round(totalContractCost * shiftMultiplier);
  const halfPaymentAmount = Math.round(finalTotalAmount / 2);
  const fullDiscountedAmount = Math.round(finalTotalAmount - 150);

  const stepsList = isHi
    ? ['अनुबंध योजना', 'समय व काम', 'घर का पता', 'भुगतान']
    : ['Contract Plan', 'Schedule & Tasks', 'Address', 'Payment'];

  const handleNext = () => {
    if (step < stepsList.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else onClose();
  };

  const handleConfirmSubscription = (gatewayMethod: string) => {
    setIsProcessing(true);
    const newContractCode = `MM-SUB-${Math.floor(100000 + Math.random() * 900000)}`;
    setContractId(newContractCode);

    const chargeAmount =
      paymentMode === 'split' ? halfPaymentAmount : paymentMode === 'full' ? fullDiscountedAmount : platformGuaranteeFee;

    initiatePayment({
      amountRupees: chargeAmount,
      customerName: currentUser?.fullName || 'Household Member',
      customerPhone: currentUser?.phone || '9876543210',
      description: `MadadMitra ${plan.toUpperCase()} Contract - ${worker.name}`,
      notes: { workerId: worker.id, contractId: newContractCode, plan, method: gatewayMethod },
      onSuccess: () => {
        setIsProcessing(false);

        // Activate active contract in global state
        setContractActive(true);
        setContractWorker(worker.name);

        // Add to user bookings schedule
        addBooking({
          id: `sub_${Date.now()}`,
          bookingCode: newContractCode,
          workerName: worker.name,
          workerId: worker.id,
          service: worker.service,
          date: startDate,
          time: selectedShift === 'both' ? `${morningTime} & ${eveningTime}` : selectedShift === 'morning' ? morningTime : eveningTime,
          status: 'accepted',
          paymentStatus: 'paid_online',
          fee: platformGuaranteeFee,
          totalAmount: finalTotalAmount,
          area: worker.area,
          address: `${address} (Society: ${societyName})`,
          notes: `${isMonthly ? '30-Day Monthly Contract' : 'Weekly Pass'} • Shift: ${selectedShift} • Family: ${familyMembers} • Absence Guarantee Active`,
        });

        setPaymentSuccess(true);
      },
      onError: (errMsg) => {
        setIsProcessing(false);
        alert((isHi ? 'भुगतान सूचना: ' : 'Payment Notice: ') + errMsg);
      },
    });
  };

  // SUCCESS SCREEN (DIGITAL DOMESTIC CONTRACT CERTIFICATE)
  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <span className="badge bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase px-3 py-1">
            {isHi ? 'अनुबंध सक्रिय एवं पुष्ट' : 'Contract Active & Confirmed'}
          </span>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 mt-2">
            {isHi
              ? isMonthly
                ? 'मासिक घरेलू अनुबंध सक्रिय'
                : 'साप्ताहिक पास सक्रिय'
              : isMonthly
              ? 'Monthly Domestic Contract Active'
              : 'Weekly Pass Active'}
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {isHi ? (
              <><strong>{worker.name}</strong> आपके घर के लिए समर्पित मददगार के रूप में नियत की गई हैं।</>
            ) : (
              <><strong>{worker.name}</strong> has been assigned as your dedicated household helper.</>
            )}
          </p>
        </div>

        {/* OFFICIAL DIGITAL CONTRACT CERTIFICATE */}
        <div className="rounded-3xl border-2 border-emerald-500 bg-white p-6 sm:p-8 shadow-xl text-slate-900 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Certificate Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white font-bold">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  {isHi ? 'मदद मित्र घरेलू सेवा अनुबंध' : 'MadadMitra Domestic Service Contract'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Contract ID: {contractId}</p>
              </div>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold">
              {isHi ? 'सत्यापित व बीमित' : 'Verified & Insured'}
            </span>
          </div>

          {/* Assigned Worker Details */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className={`grid h-14 w-14 place-items-center rounded-2xl ${worker.avatarColor} text-white font-bold text-xl shadow-sm`}>
              {worker.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-display font-bold text-base text-slate-900">{worker.name}</h4>
                <BadgeCheck className="h-4 w-4 text-brand-600" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {SERVICE_LABELS[worker.service]} • {worker.area}
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                {isHi
                  ? 'दुकानदार गारंटी प्रमाणित • आधार कार्ड सत्यापित'
                  : 'Nodal Hardware Store Guarantor • UIDAI Verified'}
              </p>
            </div>
          </div>

          {/* Key Schedule Information */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {isHi ? 'आरंभ तिथि' : 'Start Date'}
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{startDate}</p>
              <p className="text-[10px] text-slate-500">
                {totalDays} {isHi ? 'कार्य दिवस' : 'Working Days'}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {isHi ? 'दैनिक समय' : 'Daily Timing'}
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {selectedShift === 'both' ? `${morningTime} & ${eveningTime}` : selectedShift === 'morning' ? morningTime : eveningTime}
              </p>
              <p className="text-[10px] text-slate-500">
                {selectedShift === 'both' ? (isHi ? 'दिन में 2 चक्कर' : '2 Visits / Day') : (isHi ? 'दिन में 1 चक्कर' : '1 Visit / Day')}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {isHi ? 'साप्ताहिक अवकाश' : 'Weekly Rest Day'}
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{restDay}</p>
              <p className="text-[10px] text-slate-500">{isHi ? 'निर्धारित अवकाश' : 'Scheduled Off Day'}</p>
            </div>
          </div>

          {/* Absence Guarantee Shield */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>
                {isHi
                  ? 'मदद मित्र अनुपस्थिति सुरक्षा शील्ड सक्रिय:'
                  : 'MadadMitra Absence Protection Shield Active:'}
              </span>
            </div>
            <ul className="text-[11px] text-emerald-900 space-y-1 list-disc list-inside">
              {isHi ? (
                <>
                  <li>यदि {worker.name} किसी दिन बिना पूर्व सूचना अनुपस्थित रहती हैं, तो आपके वॉलेट में <strong>₹100 स्वतः रिफंड</strong> होगा।</li>
                  <li>अचानक छुट्टी पर 45 मिनट के भीतर उसी वार्ड से <strong>मुफ़्त बैकअप हेल्पर</strong> भेजा जाएगा।</li>
                  <li>पहले 7 दिनों में किसी भी समय असंतुष्ट होने पर 100% शेष राशि रिफंड।</li>
                </>
              ) : (
                <>
                  <li>If {worker.name} is absent without notice, <strong>₹100 is automatically refunded</strong> to your wallet.</li>
                  <li>Free verified replacement helper dispatched within 45 minutes on emergency leave.</li>
                  <li>Cancel anytime within the first 7 days for a 100% pro-rata refund.</li>
                </>
              )}
            </ul>
          </div>

          {/* Financial Summary */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">
                {isHi ? 'कुल अनुबंधित शुल्क:' : 'Total Contract Cost:'}
              </span>
              <p className="text-lg font-black text-slate-900">₹{finalTotalAmount}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500">
                {isHi ? 'भुगतान स्थिति:' : 'Payment Status:'}
              </span>
              <p className="font-bold text-emerald-600">
                {paymentMode === 'split'
                  ? isHi
                    ? `50% अग्रिम चुकता (₹${halfPaymentAmount})`
                    : `50% Advance Paid (₹${halfPaymentAmount})`
                  : paymentMode === 'full'
                  ? isHi
                    ? '100% एकमुश्त चुकता'
                    : '100% Paid in Full'
                  : isHi
                  ? 'साप्ताहिक नकद भुगतान'
                  : 'Weekly Cash Plan'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setView('customer')}
            className="btn-primary flex-1 py-3.5 text-sm font-bold shadow-lg"
          >
            {isHi ? 'ग्राहक डैशबोर्ड पर जाएं (अनुबंध प्रबंधित करें)' : 'Go to Customer Dashboard (Manage Contract)'}
          </button>
          <button onClick={onClose} className="btn-secondary py-3.5 px-6 text-sm font-bold">
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-fade-in w-full max-w-full overflow-x-hidden">
      {/* Header & Stepper */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="badge bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5">
              {isMonthly
                ? isHi
                  ? '30-दिवसीय मासिक अनुबंध'
                  : '30-Day Monthly Contract'
                : isHi
                ? '7-दिवसीय साप्ताहिक पास'
                : '7-Day Weekly Pass'}
            </span>
            <span className="text-xs text-slate-500">• {worker.name}</span>
          </div>
          <h2 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">
            {isHi ? 'घरेलू सब्सक्रिप्शन अनुबंध' : 'Household Subscription Agreement'}
          </h2>

          <div className="flex items-center gap-2 mt-3">
            {stepsList.map((_, idx) => (
              <div key={idx} className="flex-1 flex items-center gap-1.5">
                <div className={`h-1.5 flex-1 rounded-full ${idx <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase px-1">
            {stepsList.map((label, idx) => (
              <span key={idx} className={idx === step ? 'text-brand-600 font-extrabold' : ''}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6 border-slate-100 shadow-sm min-h-[440px]">
        {/* STEP 0: CONTRACT PLAN OVERVIEW */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {isHi
                  ? '1. समर्पित मददगार एवं अनुबंध विवरण'
                  : '1. Dedicated Helper & Contract Overview'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHi
                  ? 'मदद मित्र अनुबंध में वही व्यक्ति रोज़ आपके घर आता है। कोई बाहरी अनजान व्यक्ति नहीं।'
                  : 'MadadMitra domestic contracts guarantee the same vetted helper visits your home every day.'}
              </p>
            </div>

            {/* Worker Highlight Box */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-brand-950 text-white shadow-md">
              <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${worker.avatarColor} text-white font-black text-2xl shadow-lg border-2 border-white/20`}>
                {worker.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-extrabold text-lg text-white">{worker.name}</h4>
                  <BadgeCheck className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-xs text-slate-300">
                  {SERVICE_LABELS[worker.service]} • {worker.area}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-amber-300" /> {worker.rating} Rating (
                  {isHi ? '48+ घरों में सेवा' : '48+ Verified Homes'}
                  )
                </div>
              </div>
            </div>

            {/* Plan Comparison Card */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 text-base">
                    {isMonthly
                      ? isHi
                        ? 'मासिक पैकेज (26 कार्य दिवस)'
                        : 'Monthly Package (26 Working Days)'
                      : isHi
                      ? 'साप्ताहिक पास (6 कार्य दिवस)'
                      : 'Weekly Pass (6 Working Days)'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {isHi ? 'प्रभावी दैनिक दर:' : 'Effective Daily Rate:'}{' '}
                    <strong className="text-emerald-700">₹{Math.round(discountedWorkerFee / totalDays)}/day</strong>{' '}
                    ({isHi ? 'सामान्य दर' : 'Regular'} ₹{perVisitBase}/visit)
                  </p>
                </div>
                <div className="text-right">
                  <span className="badge bg-emerald-600 text-white font-black text-xs px-2.5 py-1">
                    {Math.round(discountPercent * 100)}% {isHi ? 'बचत' : 'OFF'}
                  </span>
                  <p className="text-xs font-bold text-slate-500 mt-1 line-through">₹{regularTotal}</p>
                  <p className="text-2xl font-black text-slate-900">₹{discountedWorkerFee}</p>
                </div>
              </div>

              <div className="border-t border-amber-200/80 pt-2 flex items-center justify-between text-xs text-amber-950 font-bold">
                <span>{isHi ? 'आपकी सीधी बचत:' : 'Total Direct Savings:'}</span>
                <span className="text-emerald-700 font-extrabold">₹{savings} Saved!</span>
              </div>
            </div>

            {/* Core Contract Protections */}
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{isHi ? 'अनुपस्थिति रिफंड:' : 'Absence Wallet Refund:'}</strong>{' '}
                  {isHi
                    ? 'किसी भी दिन ना आने पर ₹100 सीधा आपके वॉलेट में वापस।'
                    : 'Auto ₹100 refund credited directly to your wallet for any missed day.'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <RefreshCw className="h-4 w-4 text-brand-600 shrink-0" />
                <span>
                  <strong>{isHi ? 'मुफ़्त बैकअप हेल्पर:' : 'Free Backup Dispatch:'}</strong>{' '}
                  {isHi
                    ? 'हेल्पर के अस्वस्थ होने पर 45 मिनट में दूसरा साथी उपलब्ध।'
                    : 'Instant verified replacement dispatched within 45 mins if helper is on leave.'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                <span>
                  <strong>{isHi ? '7-दिवसीय ट्रायल गारंटी:' : '7-Day Trial Guarantee:'}</strong>{' '}
                  {isHi
                    ? 'पसंद ना आने पर कभी भी रद्द करें, 100% शेष राशि वापस।'
                    : 'Cancel anytime in the first 7 days for a 100% pro-rata refund with zero penalty.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: SCHEDULE & TIMINGS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {isHi ? '2. दैनिक समय एवं काम की रूपरेखा' : '2. Daily Schedule & Task Configuration'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHi
                  ? `${worker.name} रोज़ाना आपके तय किए गए समय पर घर पहुंचेगी।`
                  : `${worker.name} will arrive punctually at your chosen daily time slot.`}
              </p>
            </div>

            {/* Shift Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                {isHi ? 'दैनिक शिफ्ट चुनें' : 'Choose Daily Shift'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedShift('morning')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedShift === 'morning'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 text-brand-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">{isHi ? '🌅 सुबह की शिफ्ट' : '🌅 Morning Shift'}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isHi ? 'नाश्ता, टिफिन व सफाई' : 'Breakfast & Daily Chores'}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-brand-700 mt-1">07:30 AM - 09:30 AM</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedShift('evening')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedShift === 'evening'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 text-brand-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">{isHi ? '🌆 शाम की शिफ्ट' : '🌆 Evening Shift'}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isHi ? 'शाम का खाना व बर्तन' : 'Dinner Prep & Kitchen Wash'}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-brand-700 mt-1">05:30 PM - 07:30 PM</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedShift('both')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedShift === 'both'
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">{isHi ? '⭐ दोनों समय' : '⭐ Both Shifts'}</p>
                    <span className="badge bg-amber-400 text-slate-950 font-extrabold text-[9px]">
                      {isHi ? 'लोकप्रिय' : 'Popular'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isHi ? 'सुबह + शाम (दो चक्कर)' : 'Morning + Evening (2 Visits)'}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-amber-800 mt-1">+40% Charge</p>
                </button>
              </div>

              {/* Exact Preferred Time Pickers */}
              <div className="space-y-2 pt-1">
                {selectedShift !== 'evening' && (
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">
                      {isHi ? 'सुबह आगमन समय:' : 'Morning Arrival Time:'}
                    </span>
                    <select
                      value={morningTime}
                      onChange={(e) => setMorningTime(e.target.value)}
                      className="input-field py-1 px-2 text-xs max-w-[130px] bg-white font-bold text-brand-700"
                    >
                      <option value="07:00 AM">07:00 AM</option>
                      <option value="07:30 AM">07:30 AM</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="08:30 AM">08:30 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                    </select>
                  </div>
                )}
                {selectedShift !== 'morning' && (
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">
                      {isHi ? 'शाम आगमन समय:' : 'Evening Arrival Time:'}
                    </span>
                    <select
                      value={eveningTime}
                      onChange={(e) => setEveningTime(e.target.value)}
                      className="input-field py-1 px-2 text-xs max-w-[130px] bg-white font-bold text-brand-700"
                    >
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="05:30 PM">05:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="06:30 PM">06:30 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Start Date & Weekly Rest Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {isHi ? 'काम शुरू करने की तारीख' : 'Contract Start Date'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {isHi ? 'साप्ताहिक अवकाश का दिन' : 'Weekly Rest Day'}
                </label>
                <select
                  value={restDay}
                  onChange={(e) => setRestDay(e.target.value)}
                  className="input-field py-2 text-sm bg-white"
                >
                  <option value={isHi ? 'रविवार (Sunday)' : 'Sunday'}>
                    {isHi ? 'रविवार (मानक)' : 'Sunday (Standard)'}
                  </option>
                  <option value={isHi ? 'सोमवार' : 'Monday'}>{isHi ? 'सोमवार' : 'Monday'}</option>
                  <option value={isHi ? 'मंगलवार' : 'Tuesday'}>{isHi ? 'मंगलवार' : 'Tuesday'}</option>
                  <option value={isHi ? 'बुधवार' : 'Wednesday'}>{isHi ? 'बुधवार' : 'Wednesday'}</option>
                  <option value={isHi ? 'गुरुवार' : 'Thursday'}>{isHi ? 'गुरुवार' : 'Thursday'}</option>
                  <option value={isHi ? 'शुक्रवार' : 'Friday'}>{isHi ? 'शुक्रवार' : 'Friday'}</option>
                  <option value={isHi ? 'शनिवार' : 'Saturday'}>{isHi ? 'शनिवार' : 'Saturday'}</option>
                </select>
              </div>
            </div>

            {/* Specific Chores Checklist for Cooks or Cleaners */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-600" />
                {isHi ? 'परिवार के सदस्य व दैनिक काम' : 'Household Size & Task Preferences'}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  isHi ? '2-3 सदस्य' : '2-3 Members',
                  isHi ? '4-5 सदस्य' : '4-5 Members',
                  isHi ? '6+ सदस्य' : '6+ Members',
                ].map((mem) => (
                  <button
                    key={mem}
                    type="button"
                    onClick={() => setFamilyMembers(mem)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold text-center ${
                      familyMembers === mem
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {mem}
                  </button>
                ))}
              </div>

              {worker.service === 'cook' && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {isHi ? 'दैनिक रोटियों की संख्या:' : 'Daily Roti Count:'}
                    </span>
                    <select
                      value={rotisCount}
                      onChange={(e) => setRotisCount(e.target.value)}
                      className="input-field py-1 px-2 text-xs max-w-[130px] bg-white font-bold"
                    >
                      <option value="12">{isHi ? '10 - 12 रोटियां' : '10 - 12 Rotis'}</option>
                      <option value="18">{isHi ? '15 - 18 रोटियां' : '15 - 18 Rotis'}</option>
                      <option value="25">{isHi ? '20 - 25 रोटियां' : '20 - 25 Rotis'}</option>
                      <option value="30">{isHi ? '30+ रोटियां' : '30+ Rotis'}</option>
                    </select>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {(['veg', 'jain', 'nonveg'] as const).map((diet) => (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => setDietType(diet)}
                        className={`flex-1 py-1.5 rounded-lg border font-bold uppercase text-[10px] ${
                          dietType === diet
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {diet === 'veg'
                          ? isHi
                            ? 'शुद्ध शाकाहारी'
                            : 'Pure Veg'
                          : diet === 'jain'
                          ? isHi
                            ? 'जैन भोजन'
                            : 'Jain Diet'
                          : isHi
                          ? 'नॉन-वेज सहित'
                          : 'With Non-Veg'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {worker.service === 'cleaner' && (
                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMopping}
                      onChange={(e) => setIncludeMopping(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">
                      {isHi
                        ? 'दैनिक झाड़ू-पोछा (सभी कमरे व बालकनी)'
                        : 'Daily Sweeping & Mopping (All rooms & balcony)'}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeUtensils}
                      onChange={(e) => setIncludeUtensils(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">
                      {isHi
                        ? 'किचन के बर्तन व सिंक की साफ़-सफ़ाई'
                        : 'Kitchen Utensils & Sink Degreasing'}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: ADDRESS & GATE PASS */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {isHi ? '3. घर का पता एवं सोसायटी निर्देश' : '3. Service Address & Society Access'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHi
                  ? 'मदद मित्र ऐप सुरक्षा गार्ड के लिए डिजिटल गेट पास जारी करता है।'
                  : 'MadadMitra generates a verified digital entry pass for your society gate security.'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  {isHi ? 'मकान / फ्लैट संख्या एवं पूरा पता' : 'House / Flat Number & Complete Address'}
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field p-3 text-sm"
                  placeholder={isHi ? 'मकान नं., गली नं., निकटतम मंदिर/दुकान' : 'Flat/House No., Street, Landmark'}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {isHi ? 'अपार्टमेंट / कॉलोनी / मोहल्ले का नाम' : 'Apartment / Society / Colony Name'}
                </label>
                <input
                  type="text"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="e.g. Civil Lines, Green Park Enclave"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  {isHi ? 'हेल्पर के लिए विशेष निर्देश (घर के नियम)' : 'Special House Instructions / Rules'}
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder={isHi ? 'e.g. जूते बाहर उतारें, सुबह 8 बजे से पहले खाना बनाएं' : 'e.g. Leave footwear outside, mild spice'}
                />
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  {isHi ? (
                    <>{worker.name} के पास <strong>मदद मित्र डिजिटल आई.डी. और आधार कार्ड</strong> होगा जिसे सोसायटी गार्ड सीधे स्कैन कर सकता है।</>
                  ) : (
                    <>{worker.name} carries an official <strong>MadadMitra Digital QR ID & Aadhaar verification</strong> for seamless society security gate entry.</>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & FINANCIAL CONTRACT */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {isHi ? '4. पारदर्शी अनुबंधित भुगतान' : '4. Flexible Payment Schedule'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHi
                  ? 'सुरक्षित किस्तों में भुगतान, कोई जबरन पूर्ण लॉक-इन नहीं।'
                  : 'Safe milestone-based payments designed with zero forced upfront lock-in.'}
              </p>
            </div>

            {/* Bill Breakdown Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>
                  {isHi
                    ? isMonthly
                      ? 'मासिक सेवा शुल्क (26 दिन)'
                      : 'साप्ताहिक सेवा शुल्क (6 दिन)'
                    : isMonthly
                    ? 'Base Monthly Fee (26 Working Days)'
                    : 'Base Weekly Fee (6 Working Days)'}
                </span>
                <span className="font-bold text-slate-900">₹{Math.round(discountedWorkerFee * shiftMultiplier)}</span>
              </div>
              <div className="flex justify-between text-brand-700 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isHi ? 'अनुपस्थिति सुरक्षा व बैकअप शील्ड' : 'Absence Protection & Replacement Shield'}
                </span>
                <span>₹{platformGuaranteeFee}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
                <span>{isHi ? 'कुल अनुबंधित राशि:' : 'Total Contract Cost:'}</span>
                <span className="text-emerald-700 text-xl">₹{finalTotalAmount}</span>
              </div>
            </div>

            {/* Payment Schedule Modes */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700">
                {isHi ? 'भुगतान का तरीका चुनें:' : 'Select Milestone Payment Structure:'}
              </label>

              {/* Mode 1: Split Payment */}
              <div
                onClick={() => setPaymentMode('split')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMode === 'split'
                    ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-600 text-white text-[10px] font-black uppercase">
                      {isHi ? 'सबसे लोकप्रिय' : 'Recommended'}
                    </span>
                    <span className="font-display font-extrabold text-sm text-slate-900">
                      {isHi ? '50% अभी + 50% महीने के 15वें दिन' : 'Split: 50% Today + 50% Mid-Month'}
                    </span>
                  </div>
                  <span className="font-black text-brand-700 text-base">
                    ₹{halfPaymentAmount} {isHi ? 'अभी' : 'Today'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {isHi ? (
                    <>आज सिर्फ <strong>₹{halfPaymentAmount}</strong> दें। 15 दिन काम की संतुष्टि जांचने के बाद शेष 50% का भुगतान करें।</>
                  ) : (
                    <>Pay just <strong>₹{halfPaymentAmount}</strong> today. Inspect service quality for 15 days before releasing the remaining 50%.</>
                  )}
                </p>
              </div>

              {/* Mode 2: Full Prepayment with Discount */}
              <div
                onClick={() => setPaymentMode('full')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMode === 'full'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-emerald-600 text-white text-[10px] font-black uppercase">
                      {isHi ? '₹150 अतिरिक्त छूट' : 'Save Extra ₹150'}
                    </span>
                    <span className="font-display font-extrabold text-sm text-slate-900">
                      {isHi ? 'पूर्ण अग्रिम भुगतान' : '100% Full Advance Payment'}
                    </span>
                  </div>
                  <span className="font-black text-emerald-700 text-base">₹{fullDiscountedAmount}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {isHi ? (
                    <>एकमुश्त भुगतान करने पर तुरंत ₹150 की अतिरिक्त छूट पाएं। 100% रिफंड गारंटी सुरक्षित।</>
                  ) : (
                    <>Pay in full to unlock an instant ₹150 flat discount. Backed by our 100% money-back satisfaction guarantee.</>
                  )}
                </p>
              </div>

              {/* Mode 3: Pay Helper Weekly Directly */}
              <div
                onClick={() => setPaymentMode('weekly_cash')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  paymentMode === 'weekly_cash'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-sm text-slate-900">
                      {isHi ? 'हेल्पर को सीधे हर हफ्ते दें' : 'Pay Helper Weekly Cash / Direct UPI'}
                    </span>
                  </div>
                  <span className="font-black text-slate-900 text-base">
                    ₹{platformGuaranteeFee} {isHi ? 'टोकन' : 'Token'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {isHi ? (
                    <>प्लेटफ़ॉर्म गारंटी फीस (₹{platformGuaranteeFee}) अभी ऑनलाइन दें, और शेष मजदूरी सीधे {worker.name} को हर रविवार नकद दें।</>
                  ) : (
                    <>Pay the platform guarantee token (₹{platformGuaranteeFee}) online now, and pay remaining wages directly to {worker.name} every Sunday.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button onClick={handleBack} className="btn-secondary py-2.5 px-5 text-xs font-bold">
            {step === 0 ? (isHi ? 'रद्द करें' : 'Cancel') : isHi ? 'पीछे जाएं' : 'Back'}
          </button>

          {step < stepsList.length - 1 ? (
            <button onClick={handleNext} className="btn-primary py-2.5 px-6 text-xs font-bold">
              {isHi ? 'अगला कदम' : 'Next Step'}
            </button>
          ) : (
            <button
              onClick={() => handleConfirmSubscription('upi')}
              disabled={isProcessing}
              className="btn bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-8 text-xs font-black shadow-lg rounded-xl flex items-center gap-2"
            >
              {isProcessing
                ? isHi
                  ? 'अनुबंध सुरक्षित कर रहे हैं...'
                  : 'Securing Contract...'
                : paymentMode === 'split'
                ? isHi
                  ? `₹${halfPaymentAmount} देकर अनुबंध शुरू करें`
                  : `Start Contract for ₹${halfPaymentAmount}`
                : paymentMode === 'full'
                ? isHi
                  ? `₹${fullDiscountedAmount} देकर अनुबंध बुक करें`
                  : `Book Contract for ₹${fullDiscountedAmount}`
                : isHi
                ? `₹${platformGuaranteeFee} देकर अनुबंध एक्टिव करें`
                : `Activate Contract for ₹${platformGuaranteeFee}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
