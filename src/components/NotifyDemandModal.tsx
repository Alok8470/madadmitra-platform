import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, MapPin, Sparkles, Phone, ArrowRight } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { logServiceDemand } from '../services/availabilityService';
import { SERVICE_LABELS, type ServiceId } from '../data/mockData';

interface NotifyDemandModalProps {
  open: boolean;
  onClose: () => void;
  area: string;
  city?: string;
  serviceCategory?: string | null;
}

export default function NotifyDemandModal({
  open,
  onClose,
  area,
  city = 'Deoria',
  serviceCategory,
}: NotifyDemandModalProps) {
  const { currentUser } = useApp();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const cleanArea = area.replace(/\(coming soon\)/i, '').trim();
  const cleanCity = city.replace(/\(coming soon\)/i, '').trim() || 'Deoria';

  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState<string>(serviceCategory || 'all');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setErrorMsg('');
      setSelectedService(serviceCategory || 'all');
      if (currentUser?.phone) {
        setPhone(currentUser.phone.replace('+91', '').trim());
      } else {
        setPhone('');
      }
    }
  }, [open, serviceCategory, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg(
        isHi
          ? 'कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    setLoading(true);
    try {
      await logServiceDemand({
        phone: cleanPhone,
        city: cleanCity,
        area: cleanArea,
        serviceCategory: selectedService === 'all' ? null : selectedService,
        customerId: currentUser?.id,
      });
      setSubmitted(true);
    } catch {
      setErrorMsg('Failed to log request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const serviceTitle =
    selectedService !== 'all' && SERVICE_LABELS[selectedService as ServiceId]
      ? SERVICE_LABELS[selectedService as ServiceId]
      : isHi
      ? 'सभी घरेलू सेवाएं'
      : 'All Home Services';

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="py-2 text-left">
        {!submitted ? (
          <div>
            <div className="text-center">
              <div className="mx-auto grid h-13 w-13 place-items-center rounded-2xl bg-brand-50 text-brand-600 shadow-soft border border-brand-100">
                <Bell className="h-6 w-6 text-brand-600 animate-pulse" />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-900 mt-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>{isHi ? 'जल्द आ रहा है' : 'Coming Soon'}</span>
              </div>
              <h3 className="mt-2 font-display text-xl sm:text-2xl font-black text-slate-900">
                {isHi ? `${cleanArea} में लॉन्च होने पर सूचना पाएं` : `Get Notified When Live in ${cleanArea}`}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {isHi
                  ? `हम ${cleanArea} में सत्यापित स्थानीय कारीगरों को जोड़ रहे हैं। सेवा शुरू होते ही हम आपको SMS भेजेंगे।`
                  : `We are onboarding verified local partners in ${cleanArea}. Be the first to book with flat ₹10 fee.`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Location & Service chips */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">{isHi ? 'स्थान:' : 'Location:'}</span>
                  <span className="font-extrabold text-slate-900 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-600" />
                    {cleanArea} {cleanCity !== cleanArea && `(${cleanCity})`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-500 font-semibold">{isHi ? 'अनुरोधित सेवा:' : 'Requested Service:'}</span>
                  <span className="font-extrabold text-brand-700">{serviceTitle}</span>
                </div>
              </div>

              {/* Service selector if user wants a different service */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isHi ? 'अपनी पसंदीदा सेवा चुनें' : 'Which service do you need most?'}
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="input text-xs bg-white w-full"
                >
                  <option value="all">{isHi ? 'सभी सेवाएं (कुक, मेड, इलेक्ट्रीशियन...)' : 'All Services (Cook, Maid, Electrician...)'}</option>
                  <option value="cook">{SERVICE_LABELS.cook}</option>
                  <option value="cleaner">{SERVICE_LABELS.cleaner}</option>
                  <option value="electrician">{SERVICE_LABELS.electrician}</option>
                  <option value="plumber">{SERVICE_LABELS.plumber}</option>
                  <option value="carpenter">{SERVICE_LABELS.carpenter}</option>
                  <option value="painter">{SERVICE_LABELS.painter}</option>
                  <option value="all-rounder">{SERVICE_LABELS['all-rounder']}</option>
                  <option value="tag-team">{SERVICE_LABELS['tag-team']}</option>
                </select>
              </div>

              {/* Phone number input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isHi ? '10-अंकों का मोबाइल नंबर' : '10-Digit Mobile Number for SMS Notification'}
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-r-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-soft rounded-xl"
              >
                {loading ? (
                  <span>{isHi ? 'दर्ज कर रहे हैं...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>{isHi ? 'लॉन्च पर मुझे सूचित करें' : 'Notify Me When Live'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400">
                🔒 {isHi ? 'कोई स्पैम नहीं। सिर्फ सेवा शुरू होने पर 1 अलर्ट।' : 'No spam. You will only receive 1 SMS when helpers go live.'}
              </p>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3 animate-scale-in">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-soft">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900">
              {isHi ? 'आप प्राथमिकता सूची में हैं!' : "You're on the Priority List!"}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {isHi
                ? `धन्यवाद! जैसे ही ${cleanArea} में सत्यापित ${serviceTitle} की सेवा सक्रिय होगी, हम +91 ${phone} पर SMS भेजेंगे।`
                : `Thank you! As soon as verified ${serviceTitle} helpers go live in ${cleanArea}, we will notify you at +91 ${phone}.`}
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl shadow-soft"
              >
                {isHi ? 'ठीक है (Done)' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
