import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Car, Calendar, MapPin, Phone, Mail, FileText, Activity } from 'lucide-react';

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  data: any | null;
}

export default function VehicleDetailsModal({ isOpen, onClose, loading, error, data }: VehicleDetailsModalProps) {
  // Safe extraction of data based on Surepass API response structure
  // Usually the data is inside data.data or similar. We'll handle common structures.
  const details = data?.data?.client_id ? data.data : data;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col pointer-events-auto border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vehicle Details</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Verified Information via RC Lookup</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors border border-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-bold text-lg">Fetching details from RTO...</p>
                    <p className="text-slate-400 text-sm mt-1">This usually takes a few seconds</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Lookup Failed</h4>
                    <p className="text-slate-500 max-w-md">{error}</p>
                    <button 
                      onClick={onClose}
                      className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : details ? (
                  <div className="space-y-8">
                    {/* Primary Info Banner */}
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center justify-between">
                      <div>
                        <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mb-1">Registration Number</p>
                        <p className="text-3xl font-black text-slate-900 tracking-wider uppercase">{details.rc_number || 'N/A'}</p>
                      </div>
                      {details.vehicle_weight && (
                        <div className="text-right">
                          <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mb-1">Vehicle Weight 💪</p>
                          <p className="text-2xl font-black text-slate-900">{details.vehicle_weight} kg</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Owner Details */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                          <User className="w-4 h-4" /> Owner Information
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Owner Name</p>
                            <p className="text-base font-bold text-slate-900">{details.owner_name || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Father's Name</p>
                            <p className="text-base font-bold text-slate-900">{details.father_name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Details */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                          <Car className="w-4 h-4" /> Vehicle Details
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Brand</p>
                              <p className="text-sm font-bold text-slate-900">{details.maker_description || details.maker_name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Model</p>
                              <p className="text-sm font-bold text-slate-900">{details.model_description || details.model_name || details.maker_model || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Class</p>
                              <p className="text-sm font-bold text-slate-900">{details.vehicle_category || details.vehicle_class || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Fuel Type</p>
                              <p className="text-sm font-bold text-slate-900">{details.fuel_type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Color</p>
                              <p className="text-sm font-bold text-slate-900">{details.color || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Engine Number</p>
                              <p className="text-sm font-bold text-slate-900 truncate" title={details.vehicle_engine_number || details.engine_number}>
                                {details.vehicle_engine_number || details.engine_number || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Chassis Number</p>
                              <p className="text-sm font-bold text-slate-900 truncate" title={details.vehicle_chasi_number || details.chassis_number}>
                                {details.vehicle_chasi_number || details.chassis_number || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                        <FileText className="w-4 h-4" /> Registration & Contact
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <p className="text-xs font-bold uppercase">Reg. Date</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{details.registration_date || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Phone className="w-4 h-4" />
                            <p className="text-xs font-bold uppercase">Phone</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{details.mobile_number || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Mail className="w-4 h-4" />
                            <p className="text-xs font-bold uppercase">Email</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900 truncate" title={details.email}>{details.email || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {/* Address */}
                      <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Registered Address</p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">
                            {details.present_address || details.permanent_address || 'Address not available'}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : null}
              </div>
              
              {/* Footer */}
              {!loading && !error && details && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                  <button 
                    onClick={onClose}
                    className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      onClose();
                      window.location.href = '/#services';
                    }}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                  >
                    Get Scrap Value
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
