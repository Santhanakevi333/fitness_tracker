import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Sparkles,
  Key,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Flame,
  Beef,
  Droplets,
  Footprints,
  Dumbbell,
  ExternalLink,
  Edit2,
  Plus
} from 'lucide-react';
import {
  fileToBase64,
  analyzeMealPhoto,
  parseVoiceTranscript,
  getStoredApiKey,
  storeApiKey
} from '../services/geminiService';

export function AIMealVoiceScannerModal({ isOpen, onClose, onApplyToLog, currentDayLog }) {
  const [activeTab, setActiveTab] = useState('photo'); // 'photo' | 'voice' | 'settings'

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  // Photo Scanner State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const fileInputRef = useRef(null);

  // Voice Logger State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const [parsedVoiceData, setParsedVoiceData] = useState(null);
  const [voiceError, setVoiceError] = useState(null);
  const recognitionRef = useRef(null);

  // Success Notice
  const [appliedNotice, setAppliedNotice] = useState(null);

  useEffect(() => {
    setApiKey(getStoredApiKey());
  }, [isOpen]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  // Handle API Key Save
  const handleSaveApiKey = () => {
    storeApiKey(apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  // Handle Photo Selection
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPhotoError(null);
      setPhotoAnalysis(null);
      const { base64Data, mimeType, dataUrl } = await fileToBase64(file);
      setSelectedImage({ base64Data, mimeType });
      setImageDataUrl(dataUrl);
    } catch (err) {
      setPhotoError('Failed to read image file: ' + err.message);
    }
  };

  // Run Gemini Photo Analysis
  const handleAnalyzePhoto = async () => {
    if (!selectedImage) return;

    setIsAnalyzingPhoto(true);
    setPhotoError(null);
    try {
      const result = await analyzeMealPhoto({
        base64Data: selectedImage.base64Data,
        mimeType: selectedImage.mimeType,
        apiKey
      });
      setPhotoAnalysis(result);
    } catch (err) {
      setPhotoError(err.message || 'Failed to analyze meal photo.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Apply Photo Macros to Log
  const handleApplyPhotoMacros = () => {
    if (!photoAnalysis) return;

    onApplyToLog({
      type: 'photo_meal',
      caloriesToAdd: photoAnalysis.totalCalories || 0,
      proteinToAdd: photoAnalysis.totalProtein || 0,
      fiberToAdd: photoAnalysis.totalFiber || 0,
      notesAppend: `[Meal: ${photoAnalysis.mealName} (+${photoAnalysis.totalCalories} kcal, +${photoAnalysis.totalProtein}g protein)]`
    });

    setAppliedNotice(`Added ${photoAnalysis.totalCalories} kcal and ${photoAnalysis.totalProtein}g protein to today's entry!`);
    setTimeout(() => {
      setAppliedNotice(null);
      onClose();
    }, 1600);
  };

  // Toggle Voice Recording
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not natively supported in this browser. You can type or use your mobile keyboard dictation below.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceError(null);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setVoiceError(`Voice error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setVoiceError('Could not start microphone: ' + err.message);
      setIsRecording(false);
    }
  };

  // Parse Voice Transcript with AI
  const handleParseTranscript = async () => {
    if (!transcript.trim()) return;

    setIsParsingVoice(true);
    setVoiceError(null);
    try {
      const parsed = await parseVoiceTranscript({ transcript, apiKey });
      setParsedVoiceData(parsed);
    } catch (err) {
      setVoiceError(err.message || 'Failed to parse voice transcript.');
    } finally {
      setIsParsingVoice(false);
    }
  };

  // Apply Parsed Voice Data to Log
  const handleApplyVoiceData = () => {
    if (!parsedVoiceData) return;

    onApplyToLog({
      type: 'voice_log',
      data: parsedVoiceData
    });

    setAppliedNotice('Voice activity applied successfully to today\'s log!');
    setTimeout(() => {
      setAppliedNotice(null);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F3D3E]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#2A9D8F]/30 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-[#0F3D3E]/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2A9D8F]/20 flex items-center justify-between bg-[#F0F9F4]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] border border-[#2A9D8F]/40 flex items-center justify-center text-[#2A9D8F] shadow-xs">
              <Sparkles className="w-5 h-5 text-[#2A9D8F]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0F3D3E] text-base sm:text-lg flex items-center gap-2">
                AI Smart Logger
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2A9D8F] border border-[#2A9D8F]/30">
                  Gemini 1.5
                </span>
              </h3>
              <p className="text-xs text-[#355E5F]">Scan meal photos or speak to log workouts & macros</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#355E5F] hover:text-[#0F3D3E] hover:bg-[#E8F5E9] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 pt-3 pb-2 border-b border-[#2A9D8F]/15 flex items-center gap-2 bg-[#FFFFFF]">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'photo'
                ? 'bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white shadow-xs'
                : 'text-[#355E5F] hover:bg-[#E8F5E9] hover:text-[#0F3D3E]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan Meal Photo</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white shadow-xs'
                : 'text-[#355E5F] hover:bg-[#E8F5E9] hover:text-[#0F3D3E]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Activity Log</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40'
                : 'text-[#355E5F] hover:bg-[#E8F5E9]'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <span className="hidden sm:inline">API Setup</span>
          </button>
        </div>

        {/* Success Banner */}
        {appliedNotice && (
          <div className="mx-6 mt-4 p-3 bg-[#E8F5E9] border border-[#2A9D8F]/50 rounded-2xl flex items-center gap-2.5 text-xs text-[#0F3D3E] font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#2A9D8F] shrink-0" />
            <span>{appliedNotice}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: MEAL PHOTO SCANNER */}
          {activeTab === 'photo' && (
            <div className="space-y-4 animate-fadeIn">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {!imageDataUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2A9D8F]/40 hover:border-[#2A9D8F] bg-[#E8F5E9]/40 hover:bg-[#E8F5E9]/70 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] border border-[#2A9D8F]/30 flex items-center justify-center text-[#2A9D8F] shadow-xs group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7 text-[#2A9D8F]" />
                  </div>
                  <div>
                    <p className="font-extrabold text-[#0F3D3E] text-sm">Snap or Upload a Meal Photo</p>
                    <p className="text-xs text-[#355E5F] mt-1">
                      Works with camera on phone or file upload on desktop
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2A9D8F] bg-white px-3 py-1 rounded-full border border-[#2A9D8F]/30 shadow-xs">
                    Choose Photo / Take Picture
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-[#2A9D8F]/30 bg-black/5 max-h-64 flex items-center justify-center">
                    <img
                      src={imageDataUrl}
                      alt="Meal Preview"
                      className="max-h-64 w-full object-contain rounded-2xl"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImageDataUrl(null);
                        setPhotoAnalysis(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F3D3E]/70 hover:bg-[#0F3D3E] text-white backdrop-blur-xs transition-all"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!photoAnalysis && !isAnalyzingPhoto && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleAnalyzePhoto}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2A9D8F]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Analyze Macros with AI</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="py-3 px-4 bg-[#FFFFFF] hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30 rounded-xl text-xs font-bold transition-all"
                      >
                        Retake
                      </button>
                    </div>
                  )}

                  {isAnalyzingPhoto && (
                    <div className="p-6 bg-[#E8F5E9] border border-[#2A9D8F]/40 rounded-2xl text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#2A9D8F] animate-spin mx-auto" />
                      <div>
                        <p className="font-extrabold text-[#0F3D3E] text-sm">Analyzing Plate & Macros...</p>
                        <p className="text-xs text-[#355E5F] mt-0.5">
                          Detecting food items, estimating portion sizes and calculating calories & protein
                        </p>
                      </div>
                    </div>
                  )}

                  {photoError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">{photoError}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={async () => {
                            setPhotoError(null);
                            setIsAnalyzingPhoto(true);
                            try {
                              const result = await analyzeMealPhoto({
                                base64Data: selectedImage?.base64Data,
                                mimeType: selectedImage?.mimeType,
                                apiKey: ''
                              });
                              setPhotoAnalysis(result);
                            } catch (e) {
                              setPhotoError(e.message);
                            } finally {
                              setIsAnalyzingPhoto(false);
                            }
                          }}
                          className="px-3 py-1 bg-white border border-red-300 rounded-lg text-[11px] font-bold text-[#0F3D3E] hover:bg-gray-50 transition-all shadow-xs"
                        >
                          Try Demo Scan
                        </button>
                        <button
                          onClick={() => setActiveTab('settings')}
                          className="px-3 py-1 bg-[#0F3D3E] text-white rounded-lg text-[11px] font-bold hover:bg-[#1a5b5c] transition-all"
                        >
                          Check API Key
                        </button>
                      </div>
                    </div>
                  )}

                  {photoAnalysis && (
                    <div className="space-y-4 animate-fadeIn">
                      {photoAnalysis.isDemo && (
                        <div className="p-2.5 bg-[#E8F5E9] border border-[#2A9D8F]/30 rounded-xl text-xs text-[#0F3D3E] flex items-center justify-between">
                          <span className="font-medium">Showing demo meal analysis. Add your free Gemini API key in settings for custom scanning.</span>
                          <button
                            onClick={() => setActiveTab('settings')}
                            className="font-bold text-[#2A9D8F] hover:underline shrink-0 ml-2"
                          >
                            Set Key
                          </button>
                        </div>
                      )}

                      {/* Meal Card */}
                      <div className="p-4 bg-[#F0F9F4] border border-[#2A9D8F]/30 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-extrabold text-[#0F3D3E] text-base">{photoAnalysis.mealName}</h4>
                            <p className="text-xs text-[#355E5F]">
                              Estimated Confidence: <span className="font-bold text-[#2A9D8F] capitalize">{photoAnalysis.confidence || 'high'}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl bg-white border border-[#2A9D8F]/30 text-xs font-bold text-[#0F3D3E] shadow-xs">
                              {photoAnalysis.totalCalories} kcal
                            </span>
                            <span className="px-3 py-1 rounded-xl bg-[#2A9D8F] text-white text-xs font-bold shadow-xs">
                              {photoAnalysis.totalProtein}g Protein
                            </span>
                          </div>
                        </div>

                        {/* Foods breakdown */}
                        <div className="space-y-2 pt-2 border-t border-[#2A9D8F]/20">
                          <p className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wider">Detected Items & Portions</p>
                          <div className="space-y-1.5">
                            {photoAnalysis.foods?.map((food, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#2A9D8F]/15 text-xs"
                              >
                                <span className="font-bold text-[#0F3D3E]">
                                  {food.name} <span className="text-[#355E5F] font-normal">({food.portion})</span>
                                </span>
                                <div className="flex items-center gap-3 text-[#355E5F]">
                                  <span>{food.calories} cal</span>
                                  <span className="font-bold text-[#2A9D8F]">{food.protein}g P</span>
                                  {food.fiber > 0 && <span>{food.fiber}g F</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nutritional Summary Pills */}
                        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                          <div className="p-2 rounded-xl bg-white border border-[#2A9D8F]/20">
                            <span className="text-[10px] text-[#355E5F] uppercase font-bold">Carbs</span>
                            <p className="font-extrabold text-[#0F3D3E] mt-0.5">{photoAnalysis.totalCarbs || 0}g</p>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-[#2A9D8F]/20">
                            <span className="text-[10px] text-[#355E5F] uppercase font-bold">Fat</span>
                            <p className="font-extrabold text-[#0F3D3E] mt-0.5">{photoAnalysis.totalFat || 0}g</p>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-[#2A9D8F]/20">
                            <span className="text-[10px] text-[#355E5F] uppercase font-bold">Fiber</span>
                            <p className="font-extrabold text-[#0F3D3E] mt-0.5">{photoAnalysis.totalFiber || 0}g</p>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-[#2A9D8F]/20">
                            <span className="text-[10px] text-[#355E5F] uppercase font-bold">Protein</span>
                            <p className="font-extrabold text-[#2A9D8F] mt-0.5">{photoAnalysis.totalProtein || 0}g</p>
                          </div>
                        </div>

                        {photoAnalysis.tips && (
                          <p className="text-xs text-[#355E5F] bg-white/70 p-2.5 rounded-xl border border-[#2A9D8F]/20 italic">
                            &ldquo;{photoAnalysis.tips}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={handleApplyPhotoMacros}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2A9D8F]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add +{photoAnalysis.totalCalories} kcal & +{photoAnalysis.totalProtein}g Protein to Today's Log</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VOICE ACTIVITY LOG */}
          {activeTab === 'voice' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Mic Control Circle */}
              <div className="p-6 bg-[#F0F9F4] border border-[#2A9D8F]/30 rounded-2xl text-center space-y-4">
                <div className="relative inline-block">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-[#2A9D8F]/30 animate-ping"></div>
                  )}
                  <button
                    onClick={toggleRecording}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                        : 'bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:scale-105 text-white shadow-[#2A9D8F]/30'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                </div>

                <div>
                  <p className="font-extrabold text-[#0F3D3E] text-sm">
                    {isRecording ? 'Listening... Speak now!' : 'Tap Microphone & Speak'}
                  </p>
                  <p className="text-xs text-[#355E5F] mt-1 max-w-sm mx-auto">
                    Examples: <em>&ldquo;I drank 3.5 liters of water, walked 8500 steps, and did chest and triceps today.&rdquo;</em>
                  </p>
                </div>
              </div>

              {/* Transcript Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0F3D3E] flex items-center justify-between">
                  <span>Voice Transcript</span>
                  {transcript && (
                    <button
                      onClick={() => setTranscript('')}
                      className="text-[11px] text-[#355E5F] hover:text-[#0F3D3E] underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your speech transcript will appear here, or you can type directly..."
                  rows={3}
                  className="w-full bg-[#FFFFFF] border border-[#2A9D8F]/30 focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] rounded-xl p-3 text-xs text-[#0F3D3E] placeholder-[#355E5F]/60 outline-none resize-none shadow-xs"
                />
              </div>

              {voiceError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{voiceError}</span>
                </div>
              )}

              {transcript.trim() && !parsedVoiceData && !isParsingVoice && (
                <button
                  onClick={handleParseTranscript}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2A9D8F]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Extract Activity Data with AI</span>
                </button>
              )}

              {isParsingVoice && (
                <div className="p-4 bg-[#E8F5E9] border border-[#2A9D8F]/40 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-bold text-[#0F3D3E]">
                  <Loader2 className="w-4 h-4 text-[#2A9D8F] animate-spin" />
                  <span>Extracting workout, steps, water, and macros...</span>
                </div>
              )}

              {/* Parsed Results Preview */}
              {parsedVoiceData && (
                <div className="p-4 bg-[#F0F9F4] border border-[#2A9D8F]/30 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-[#0F3D3E] text-xs uppercase tracking-wide">
                      Recognized Values
                    </h4>
                    <span className="text-[11px] font-bold text-[#2A9D8F] bg-white px-2 py-0.5 rounded-md border border-[#2A9D8F]/20">
                      Ready to Merge
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {parsedVoiceData.steps !== null && (
                      <div className="p-2.5 bg-white border border-[#2A9D8F]/20 rounded-xl flex items-center gap-2">
                        <Footprints className="w-4 h-4 text-[#2A9D8F]" />
                        <div>
                          <p className="text-[10px] text-[#355E5F]">Steps</p>
                          <p className="font-bold text-[#0F3D3E]">{parsedVoiceData.steps.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {parsedVoiceData.water !== null && (
                      <div className="p-2.5 bg-white border border-[#2A9D8F]/20 rounded-xl flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-[#2A9D8F]" />
                        <div>
                          <p className="text-[10px] text-[#355E5F]">Water</p>
                          <p className="font-bold text-[#0F3D3E]">{parsedVoiceData.water} L</p>
                        </div>
                      </div>
                    )}
                    {parsedVoiceData.workout && (
                      <div className="p-2.5 bg-white border border-[#2A9D8F]/20 rounded-xl flex items-center gap-2 col-span-2 sm:col-span-1">
                        <Dumbbell className="w-4 h-4 text-[#2A9D8F]" />
                        <div>
                          <p className="text-[10px] text-[#355E5F]">Workout</p>
                          <p className="font-bold text-[#0F3D3E] truncate">{parsedVoiceData.workout}</p>
                        </div>
                      </div>
                    )}
                    {parsedVoiceData.caloriesEaten !== null && (
                      <div className="p-2.5 bg-white border border-[#2A9D8F]/20 rounded-xl flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#2A9D8F]" />
                        <div>
                          <p className="text-[10px] text-[#355E5F]">Calories</p>
                          <p className="font-bold text-[#0F3D3E]">{parsedVoiceData.caloriesEaten} kcal</p>
                        </div>
                      </div>
                    )}
                    {parsedVoiceData.proteinEaten !== null && (
                      <div className="p-2.5 bg-white border border-[#2A9D8F]/20 rounded-xl flex items-center gap-2">
                        <Beef className="w-4 h-4 text-[#2A9D8F]" />
                        <div>
                          <p className="text-[10px] text-[#355E5F]">Protein</p>
                          <p className="font-bold text-[#0F3D3E]">{parsedVoiceData.proteinEaten} g</p>
                        </div>
                      </div>
                    )}
                    {parsedVoiceData.weight !== null && (
                      <div className="p-2.5 bg-white border border-[#2A9D8F]/20 rounded-xl flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2A9D8F]">KG</span>
                        <div>
                          <p className="text-[10px] text-[#355E5F]">Weight</p>
                          <p className="font-bold text-[#0F3D3E]">{parsedVoiceData.weight} kg</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {parsedVoiceData.summary && (
                    <p className="text-xs text-[#355E5F] bg-white p-2.5 rounded-xl border border-[#2A9D8F]/15">
                      {parsedVoiceData.summary}
                    </p>
                  )}

                  <button
                    onClick={handleApplyVoiceData}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2A9D8F]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Recognized Data to Today's Log</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS & GEMINI API KEY */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-[#F0F9F4] border border-[#2A9D8F]/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#2A9D8F]" />
                  <h4 className="font-bold text-[#0F3D3E] text-sm">Google Gemini 1.5 Flash API Key</h4>
                </div>
                <p className="text-xs text-[#355E5F] leading-relaxed">
                  Powers the multimodal food image recognition and voice transcript parsing. Free tier provides up to <strong>15 requests per minute</strong> at no cost.
                </p>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[#0F3D3E]">Enter your API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-[#FFFFFF] border border-[#2A9D8F]/30 focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F] rounded-xl px-3 py-2.5 text-xs text-[#0F3D3E] outline-none shadow-xs"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#2A9D8F] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Get Free API Key on Google AI Studio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleSaveApiKey}
                      className="px-4 py-2 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white rounded-xl text-xs font-bold shadow-xs hover:scale-[1.02] transition-all"
                    >
                      {keySaved ? 'Saved!' : 'Save Key'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#E8F5E9] border border-[#2A9D8F]/40 rounded-2xl text-xs text-[#0F3D3E] space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2A9D8F]" />
                  <span>Demo Mode Included</span>
                </p>
                <p className="text-[#355E5F] leading-relaxed">
                  If you don't have an API key right now, you can still test both the <strong>Scan Meal Photo</strong> and <strong>Voice Activity Log</strong>. The app will automatically run realistic simulations so you can experience the workflow!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

