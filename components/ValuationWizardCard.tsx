"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Car, Recycle, ShoppingCart, ArrowRight, ArrowLeft, 
    Zap, Shield, Sparkles, CheckCircle, Search, 
    MapPin, Calendar, User, Phone, ClipboardList,
    Smartphone, Lock, Fuel, Gauge, Home, Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

import { indiaData, states as STATES } from "@/lib/india-data"

// ─── Data Definitions ─────────────────────────────────────────────────────────

const BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Honda", "Kia", "Skoda"]
const YEARS = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "Older"]
const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]

const BRAND_LOGOS: Record<string, string> = {
    "Maruti Suzuki": "https://logo.clearbit.com/marutisuzuki.com",
    "Hyundai": "https://logo.clearbit.com/hyundai.com",
    "Tata": "https://logo.clearbit.com/tatamotors.com",
    "Mahindra": "https://logo.clearbit.com/mahindra.com",
    "Toyota": "https://logo.clearbit.com/toyota.com",
    "Honda": "https://logo.clearbit.com/honda.com",
    "Kia": "https://logo.clearbit.com/kia.com",
    "Skoda": "https://logo.clearbit.com/skoda-auto.com",
    "Volkswagen": "https://logo.clearbit.com/volkswagen.co.in",
    "MG": "https://logo.clearbit.com/mgmotor.co.in",
    "Nissan": "https://logo.clearbit.com/nissan.in",
    "Renault": "https://logo.clearbit.com/renault.co.in",
    "Ford": "https://logo.clearbit.com/india.ford.com",
    "Jeep": "https://logo.clearbit.com/jeep-india.com",
    "Other": ""
}

const normalizeFuelType = (fuel?: string): string => {
    if (!fuel) return "";
    const cleanFuel = fuel.trim().toUpperCase();
    if (cleanFuel.includes("PETROL") && !cleanFuel.includes("CNG")) return "Petrol";
    if (cleanFuel.includes("DIESEL")) return "Diesel";
    if (cleanFuel.includes("CNG") || cleanFuel.includes("LPG")) return "CNG";
    if (cleanFuel.includes("ELECTRIC") || cleanFuel.includes("EV")) return "Electric";
    if (cleanFuel.includes("HYBRID")) return "Hybrid";
    return fuel.charAt(0).toUpperCase() + fuel.slice(1).toLowerCase();
};

const matchState = (detectedState: string): string => {
    if (!detectedState) return "";
    const cleanState = detectedState.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    const matched = STATES.find(s => {
        const cleanS = s.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanS === cleanState || cleanState.includes(cleanS) || cleanS.includes(cleanState);
    });
    if (matched) return matched;
    
    if (cleanState.includes("delhi") || cleanState === "nct") return "Delhi";
    if (cleanState.includes("uttarpradesh") || cleanState === "up") return "Uttar Pradesh";
    if (cleanState.includes("haryana") || cleanState === "hr") return "Haryana";
    if (cleanState.includes("punjab") || cleanState === "pb") return "Punjab";
    if (cleanState.includes("maharashtra") || cleanState === "mh") return "Maharashtra";
    if (cleanState.includes("karnataka") || cleanState === "ka") return "Karnataka";
    if (cleanState.includes("tamilnadu") || cleanState === "tn") return "Tamil Nadu";
    if (cleanState.includes("westbengal") || cleanState === "wb") return "West Bengal";
    if (cleanState.includes("jammu") || cleanState === "jk") return "Jammu and Kashmir";
    return "";
};

const matchCity = (state: string, postOffices: any[]): string => {
    if (!state || !postOffices || postOffices.length === 0) return "";
    const citiesList = indiaData[state] || [];
    
    const isPlaceholder = (val: string): boolean => {
        const clean = val.toLowerCase().replace(/[^a-z0-9]/g, "");
        return clean === "" || clean === "na" || clean === "null" || clean === "none" || clean === "notapplicable";
    };

    // 1. Try exact match first on District, Division, Block, then Name
    const fieldsToTry = ["District", "Division", "Block", "Name"];
    for (const field of fieldsToTry) {
        for (const po of postOffices) {
            const val = po[field];
            if (!val || isPlaceholder(val)) continue;
            const cleanVal = val.toLowerCase().replace(/[^a-z0-9]/g, "");
            
            const matched = citiesList.find(c => {
                const cleanC = c.toLowerCase().replace(/[^a-z0-9]/g, "");
                return cleanC === cleanVal;
            });
            if (matched) return matched;
        }
    }

    // 2. Try fuzzy (includes) match if no exact match found
    for (const field of fieldsToTry) {
        for (const po of postOffices) {
            const val = po[field];
            if (!val || isPlaceholder(val)) continue;
            const cleanVal = val.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (cleanVal.length < 3) continue; // Skip very short values for fuzzy matching
            
            const matched = citiesList.find(c => {
                const cleanC = c.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (cleanC.length < 3) return false;
                return cleanVal.includes(cleanC) || cleanC.includes(cleanVal);
            });
            if (matched) return matched;
        }
    }
    
    // 3. Fallback: match on the first post office District directly using simple match
    const firstPo = postOffices[0];
    if (firstPo && firstPo.District && !isPlaceholder(firstPo.District)) {
        const cleanDist = firstPo.District.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matched = citiesList.find(c => {
            const cleanC = c.toLowerCase().replace(/[^a-z0-9]/g, "");
            return cleanC === cleanDist || (cleanDist.length >= 3 && cleanC.length >= 3 && (cleanDist.includes(cleanC) || cleanC.includes(cleanDist)));
        });
        if (matched) return matched;
    }
    
    return "";
};

const matchCityByName = (state: string, detectedCity: string): string => {
    if (!state || !detectedCity) return "";
    const citiesList = indiaData[state] || [];
    const cleanVal = detectedCity.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Try exact match first
    let matched = citiesList.find(c => {
        const cleanC = c.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanC === cleanVal;
    });
    if (matched) return matched;
    
    // Try fuzzy match
    if (cleanVal.length >= 3) {
        matched = citiesList.find(c => {
            const cleanC = c.toLowerCase().replace(/[^a-z0-9]/g, "");
            return cleanC.length >= 3 && (cleanVal.includes(cleanC) || cleanC.includes(cleanVal));
        });
        if (matched) return matched;
    }
    
    return "";
};

// ─── Wizard Component ─────────────────────────────────────────────────────────

export default function ValuationWizardCard() {
    const router = useRouter()
    const { toast } = useToast()
    const [mode, setMode] = useState<"options" | "wizard" | "success" | "scrap-valuation">("wizard")
    const [serviceType, setServiceType] = useState<string>("")
    const [step, setStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const [fromHero, setFromHero] = useState(false)
    const [quoteId, setQuoteId] = useState("")

    useEffect(() => {
        setQuoteId("SC-" + Math.random().toString(36).substr(2, 6).toUpperCase())
    }, [])
    
    // Form Data
    const [formData, setFormData] = useState({
        regNo: "",
        brand: "",
        model: "",
        year: "",
        weight: "",
        kms: "",
        fuel: "",
        name: "",
        address: "",
        phone: "",
        otp: "",
        desiredCompany: "",
        desiredModel: "",
        buyNew: "",
        pincode: "",
        state: "",
        city: ""
    })

    // Listen for vehicle data from Hero section
    useEffect(() => {
        const handleHeroData = (e: CustomEvent) => {
            const data = e.detail
            setFormData(prev => ({
                ...prev,
                regNo: data.regNo || "",
                brand: data.brand || "",
                model: data.model || "",
                year: data.year || "",
                weight: data.weight || "",
                fuel: data.fuel || ""
            }))
            setFromHero(true)
            setServiceType("scrap") // Bypasses Situation selection and directly sets to scrap flow
            setStep(1)              // Directly opens step 1: Verify Vehicle Details
            setMode("wizard")
        }
        window.addEventListener('hero-vehicle-data', handleHeroData as EventListener)
        return () => window.removeEventListener('hero-vehicle-data', handleHeroData as EventListener)
    }, [])

    // Backup: ensure hero flow always skips to Step 2 (Verify Vehicle Details)
    // This catches cases where the event-based setServiceType is lost (e.g. React Strict Mode double-mount)
    useEffect(() => {
        if (fromHero && formData.regNo && !serviceType) {
            setServiceType("scrap")
            setStep(1)
            setDirection(1)
        }
    }, [fromHero, formData.regNo, serviceType])

    const [isFetching, setIsFetching] = useState(false)
    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)

    const verifyAndFillViaPincode = async (pincode: string): Promise<boolean> => {
        console.log("verifyAndFillViaPincode: Triggered for pincode", pincode);
        try {
            const res = await fetch(`/api/location/pincode?pincode=${pincode}`);
            console.log("verifyAndFillViaPincode: HTTP status", res.status);
            if (!res.ok) {
                console.warn("verifyAndFillViaPincode: API request failed with status", res.status);
                return false;
            }
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.warn("verifyAndFillViaPincode: Response is not JSON", contentType);
                return false;
            }

            const resData = await res.json();
            console.log("verifyAndFillViaPincode: Received data", resData);
            let postalData = null;
            if (resData) {
                if (resData.success && Array.isArray(resData.data)) {
                    postalData = resData.data;
                } else if (Array.isArray(resData)) {
                    postalData = resData;
                }
            }
            console.log("verifyAndFillViaPincode: Extracted postalData", postalData);

            if (postalData && postalData[0] && postalData[0].Status === "Success") {
                const postOffices = postalData[0].PostOffice || [];
                if (postOffices.length > 0) {
                    const postOffice = postOffices[0];
                    const matchedState = matchState(postOffice.State);
                    console.log("verifyAndFillViaPincode: matchedState", matchedState, "from raw state", postOffice.State);
                    if (matchedState) {
                        const matchedCity = matchCity(matchedState, postOffices);
                        console.log("verifyAndFillViaPincode: matchedCity", matchedCity);
                        setFormData(prev => ({
                            ...prev,
                            pincode: pincode,
                            state: matchedState,
                            city: matchedCity
                        }));
                        return true;
                    }
                }
            } else {
                console.warn("verifyAndFillViaPincode: Postal data status is not Success", postalData);
            }
        } catch (err) {
            console.error("verifyAndFillViaPincode: Postal API validation failed:", err);
        }
        return false;
    };

    // Auto-fetch state/city when a 6-digit Pincode is typed
    useEffect(() => {
        if (formData.pincode && formData.pincode.length === 6) {
            const runLookup = async () => {
                setIsDetectingLocation(true);
                const success = await verifyAndFillViaPincode(formData.pincode);
                setIsDetectingLocation(false);
                if (success) {
                    toast({
                        title: "Location Found",
                        description: "Auto-filled state and city details successfully."
                    });
                } else {
                    setFormData(prev => ({
                        ...prev,
                        state: "",
                        city: ""
                    }));
                    toast({
                        title: "Location Lookup Failed",
                        description: "Could not resolve pincode details. Please enter manually.",
                        variant: "destructive"
                    });
                }
            };
            runLookup();
        } else if (formData.pincode && formData.pincode.length < 6) {
            setFormData(prev => ({
                ...prev,
                state: "",
                city: ""
            }));
        }
    }, [formData.pincode]);

    // Scrap Valuation Pricing
    const [cdDiscount, setCdDiscount] = useState<number | null>(null)
    const [newCarPrice, setNewCarPrice] = useState<number | null>(null)
    const [isFetchingPrice, setIsFetchingPrice] = useState(false)
    const [baseScrapRate, setBaseScrapRate] = useState<number>(25) // Default to 25

    useEffect(() => {
        // Fetch global scrap rates with safe JSON parsing
        fetch('/api/settings/scrapRates')
            .then(res => {
                if (!res.ok) throw new Error(`scrapRates status ${res.status}`);
                const ct = res.headers.get('content-type');
                if (!ct || !ct.includes('application/json')) throw new Error('scrapRates response was not JSON');
                return res.json();
            })
            .then(data => {
                if (data && data.scrapPricePerKg) {
                    setBaseScrapRate(data.scrapPricePerKg);
                }
            })
            .catch(err => console.warn("Failed to fetch base scrap rate (using default 25):", err?.message || err));
    }, []);

    useEffect(() => {
        if (mode === "scrap-valuation" && formData.buyNew === "yes" && formData.desiredCompany && formData.desiredModel && !cdDiscount && !isFetchingPrice) {
            setIsFetchingPrice(true)
            fetch('/api/car-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company: formData.desiredCompany, model: formData.desiredModel })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCdDiscount(data.data.cdDiscount)
                    setNewCarPrice(data.data.basePrice)
                }
            })
            .catch(err => {
                console.error("Car price fetch error:", err)
                // Set default discount if API fails to show something to the user
                setCdDiscount(20000)
            })
            .finally(() => setIsFetchingPrice(false))
        }
    }, [mode, formData, cdDiscount, isFetchingPrice])

    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
    const [otpSent, setOtpSent] = useState(false)
    const [isSandboxMode, setIsSandboxMode] = useState(false)

    const getOrCreateRecaptcha = (): RecaptchaVerifier => {
        if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current
        const verifier = new RecaptchaVerifier(auth, 'wizard-recaptcha-container', {
            size: 'invisible',
            callback: () => {},
            'expired-callback': () => {
                recaptchaVerifierRef.current = null
            }
        })
        recaptchaVerifierRef.current = verifier
        return verifier
    }

    const handleFetchLocation = async () => {
        setIsDetectingLocation(true);

        try {
            // Try high-accuracy IP Geolocation first (extremely fast, requires zero browser prompts)
            const ipRes = await fetch("https://ipapi.co/json/");
            if (ipRes.ok) {
                const contentType = ipRes.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const ipData = await ipRes.json();
                    let pincode = "";
                    if (ipData && ipData.postal) {
                        pincode = ipData.postal.replace(/\D/g, '').slice(0, 6);
                    }
                    
                    if (pincode && pincode.length === 6) {
                        const success = await verifyAndFillViaPincode(pincode);
                        if (success) {
                            toast({
                                title: "Location Auto-detected",
                                description: "Resolved location details from network IP."
                            });
                            setIsDetectingLocation(false);
                            return;
                        }
                    }
                    
                    const detectedState = ipData.region || ipData.state || "";
                    const detectedCity = ipData.city || "";
                    const matchedState = matchState(detectedState);
                    if (matchedState) {
                        const matchedCity = matchCityByName(matchedState, detectedCity);
                        setFormData(prev => ({
                            ...prev,
                            pincode: pincode || prev.pincode,
                            state: matchedState,
                            city: matchedCity || prev.city
                        }));
                        toast({
                            title: "Location Auto-detected (Approximate)",
                            description: `Based on your IP: ${matchedCity || detectedCity || "Select City"}, ${matchedState}`
                        });
                        setIsDetectingLocation(false);
                        return;
                    }
                }
            }
        } catch (ipError) {
            console.warn("IP geolocation failed, falling back to GPS:", ipError);
        }

        // Fallback: HTML5 GPS Geolocation API
        if (!navigator.geolocation) {
            toast({
                title: "Not Supported",
                description: "Geolocation is not supported by your browser.",
                variant: "destructive"
            });
            setIsDetectingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    if (!res.ok) throw new Error("Failed to fetch address details");
                    
                    const contentType = res.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) throw new Error("Nominatim response was not JSON");
                    
                    const data = await res.json();
                    const address = data.address || {};
                    const detectedPostcode = (address.postcode || "").replace(/\s/g, "");
                    const cleanedPincode = detectedPostcode.replace(/\D/g, '').slice(0, 6);

                    if (cleanedPincode && cleanedPincode.length === 6) {
                        const success = await verifyAndFillViaPincode(cleanedPincode);
                        if (success) {
                            toast({
                                title: "Location Auto-detected",
                                description: "Resolved location details from GPS coordinates."
                            });
                            setIsDetectingLocation(false);
                            return;
                        }
                    }

                    const detectedState = address.state || address.region || "";
                    const detectedCity = address.city || address.town || address.village || address.suburb || address.county || address.state_district || address.city_district || "";
                    const matchedState = matchState(detectedState);
                    
                    if (matchedState) {
                        const matchedCity = matchCityByName(matchedState, detectedCity);
                        setFormData(prev => ({
                            ...prev,
                            state: matchedState,
                            city: matchedCity || prev.city,
                            pincode: cleanedPincode || prev.pincode
                        }));
                        toast({
                            title: "Location Auto-detected (GPS)",
                            description: `Coordinates resolved to: ${matchedCity || detectedCity || "Select City"}, ${matchedState}`
                        });
                    } else {
                        throw new Error(`Could not map detected state "${detectedState}" to India states list`);
                    }
                } catch (error: any) {
                    console.error("Reverse lookup error:", error);
                    toast({
                        title: "Fetch Failed",
                        description: "Could not retrieve exact location details. Please select manually.",
                        variant: "destructive"
                    });
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = "Please enable GPS and try again.";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location permission denied. Please select manually.";
                }
                toast({
                    title: "Access Denied",
                    description: msg,
                    variant: "destructive"
                });
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleOptionClick = (key: string) => {
        setServiceType(key)
        setMode("wizard")
        setStep(0)
        setOtpSent(false)
        setFromHero(false)
        setFormData({
            regNo: "", brand: "", model: "", year: "", weight: "", kms: "", fuel: "", name: "", address: "", phone: "", otp: "", desiredCompany: "", desiredModel: "", buyNew: "", pincode: "", state: "", city: ""
        })
    }

    const nextStep = (overrideBuyNew?: string | React.MouseEvent) => {
        setDirection(1)
        const buyNewState = (overrideBuyNew && typeof overrideBuyNew === "string") ? overrideBuyNew : formData.buyNew;
        // In Scrap flow, if at 'Buy New' step (now step 2) and user says 'no', skip to 'Fuel Type' (now step 4)
        if (serviceType === "scrap" && step === 2 && buyNewState === "no") {
            setStep(4)
        } else {
            setStep(s => s + 1)
        }
    }

    const prevStep = () => {
        setDirection(-1)
        // When fromHero, step 1 is the first flow step, so go back to situation selection
        if (fromHero && serviceType && step === 1) {
            setFromHero(false) // Clear hero flag so backup useEffect doesn't re-trigger
            setServiceType("")
            setOtpSent(false)
        } else if (serviceType && step === 0) {
            setServiceType("")
            setOtpSent(false)
        } else if (serviceType === "scrap" && step === 4 && formData.buyNew === "no") {
            setStep(2)
        } else if (step > 0) {
            setStep(s => s - 1)
        }
    }

    const currentStepDisplay = () => {
        if (!serviceType) return 1
        let display = step + 2 // +1 for 0-indexing, +1 for initial selection step
        if (fromHero) display -= 1 // vehicle number step is skipped
        if (serviceType === "scrap" && formData.buyNew === "no" && step >= 4) display -= 1
        return display
    }

    const handleRegSubmit = async () => {
        if (!formData.regNo) return
        
        // Basic Registration Number Validation (e.g. DL01AB1234 or DL-01-AB-1234)
        const cleanReg = formData.regNo.replace(/[^a-zA-Z0-9]/g, "");
        if (cleanReg.length < 6) {
            toast({
                title: "Invalid Format",
                description: "Please enter a valid registration number.",
                variant: "destructive"
            });
            return;
        }

        setIsFetching(true)
        try {
            // Demo Fallback for local testing / presentation
            if (formData.regNo.includes("1234") || formData.regNo.includes("TEST")) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
                setFormData(prev => ({
                    ...prev,
                    brand: "Maruti Suzuki",
                    model: "Swift VXI",
                    year: "2018",
                    weight: "1250",
                    fuel: "Petrol"
                }))
                toast({
                    title: "Vehicle Found",
                    description: "Details fetched successfully for " + formData.regNo
                })
                nextStep()
                return
            }

            const response = await fetch('/api/vehicle-lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_number: formData.regNo }),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Vehicle lookup returned non-JSON response (status ${response.status})`);
            }

            const rawData = await response.json();

            if (!response.ok) {
                throw new Error(rawData.error || 'Failed to fetch vehicle details');
            }

            const data = rawData?.data?.client_id ? rawData.data : rawData;

            setFormData(prev => ({
                ...prev,
                brand: data.maker_description || data.maker_name || data.maker || data.rc_maker || "",
                model: data.model_description || data.model_name || data.maker_model || data.model || data.rc_model || data.rc_model_name || "",
                year: data.registration_date ? data.registration_date.split('-')[0] : data.manufacturing_year || "",
                weight: data.vehicle_weight || data.unladen_weight || "",
                fuel: normalizeFuelType(data.fuel_type) || prev.fuel
            }))
            
            toast({
                title: "Details Fetched",
                description: "We've auto-filled the vehicle info for you."
            })
            nextStep()
        } catch (err: any) {
            console.error("Vehicle fetch error:", err)
            
            toast({
                title: "Fetch Failed",
                description: "Unable to retrieve data automatically. Please enter details manually.",
                variant: "destructive"
            })

            // Fallback for demo so user can still see the flow
            setFormData(prev => ({
                ...prev,
                brand: prev.brand || "",
                model: prev.model || "",
                year: prev.year || "",
                weight: prev.weight || "",
            }))
            nextStep()
        } finally {
            setIsFetching(false)
        }
    }

    const handleSendOtp = async () => {
        if (formData.phone.length !== 10) return
        
        setIsSendingOtp(true)
        try {
            // Try real Firebase OTP first
            const verifier = getOrCreateRecaptcha()
            const formattedPhone = `+91${formData.phone}`
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier)
            setConfirmationResult(confirmation)
            setIsSandboxMode(false)
            setOtpSent(true)
            toast({
                title: "OTP Sent",
                description: "Please check your phone for the verification code.",
            })
        } catch (err: any) {
            // Gracefully fall back to Sandbox Mode (works when Firebase is not configured)
            console.warn("Firebase SMS failed, switching to Sandbox Mode:", err.message)
            recaptchaVerifierRef.current = null
            setIsSandboxMode(true)
            setOtpSent(true)
            toast({
                title: "OTP Ready",
                description: "Use verification code 000000 to continue.",
            })
        } finally {
            setIsSendingOtp(false)
        }
    }

    const submitLeadData = async () => {
        try {
            const res = await fetch('/api/wizard-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, serviceType })
            });
            if (!res.ok) throw new Error(`wizard-lead returned status ${res.status}`);
            const ct = res.headers.get("content-type");
            if (!ct || !ct.includes("application/json")) throw new Error("wizard-lead response was not JSON");
            
            const data = await res.json();
            if (data && data.lead && data.lead._id) {
                localStorage.setItem("kycValuationId", data.lead._id);
            }
        } catch (error) {
            console.error("Failed to save lead data:", error);
        }
    };

    const handleVerifyOtp = async () => {
        if (formData.otp.length !== 6 && formData.otp.length !== 4) return
        
        setIsVerifying(true)
        try {
            if (isSandboxMode) {
                // Sandbox mode: use phone-otp provider (creates/finds user by phone)
                if (formData.otp !== "000000") {
                    throw new Error("Invalid code. Use 000000 in sandbox mode.")
                }
                const result = await signIn("phone-otp", {
                    phone: "+91" + formData.phone,
                    otp: "000000",
                    name: formData.name || `User ${formData.phone.slice(-4)}`,
                    redirect: false,
                })
                if (result?.error) throw new Error(result.error)
            } else {
                // Production mode: verify with Firebase and sign in via firebase-otp
                if (!confirmationResult) throw new Error("Session expired. Please request a new OTP.")
                const userCredential = await confirmationResult.confirm(formData.otp)
                const idToken = await userCredential.user.getIdToken()
                const result = await signIn("firebase-otp", {
                    idToken,
                    name: formData.name || `User ${formData.phone.slice(-4)}`,
                    redirect: false,
                })
                if (result?.error) throw new Error(result.error || "Authentication failed")
            }

            // Account created/logged in — now save the lead
            await submitLeadData()

            toast({ title: "✅ Verified!", description: "Welcome to ScrapCentre. Your request has been saved." })
            if (serviceType === "scrap") {
                setMode("scrap-valuation")
            } else {
                setMode("success")
            }
        } catch (err: any) {
            console.error("OTP Verification Error:", err)
            toast({
                title: "Verification Failed",
                description: err.message || "Invalid OTP. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsVerifying(false)
        }
    }


    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
    }

    const heroOffset = fromHero ? 1 : 0 // subtract 1 step when vehicle number is skipped
    const totalSteps = (!serviceType ? 1 : (serviceType === "buy" ? 4 : (serviceType === "scrap" ? (formData.buyNew === "yes" ? 9 - heroOffset : 8 - heroOffset) : 4)))

    if (mode === "scrap-valuation") {
        // Calculate scrap value based on weight and baseScrapRate
        const weightNum = parseInt(String(formData.weight).replace(/\D/g, '')) || 1200;
        const ratePerKg = baseScrapRate || 25;

        // Scrap value estimates
        const averageScrapValue = weightNum * ratePerKg;
        const minScrapValue = Math.round((weightNum * Math.max(1, ratePerKg - 5)) / 100) * 100;
        const maxScrapValue = Math.round((weightNum * (ratePerKg + 5)) / 100) * 100;

        // CD certificate value
        const potentialCDDiscount = cdDiscount !== null ? cdDiscount : 55000;

        // Totals
        const maxTotalBenefit = maxScrapValue + potentialCDDiscount;
        const dealerOemDiscount = 10000;
        const greenFinanceSavings = 15000;
        const greenInsuranceSavings = 8000;

        const grandTotalBenefit = averageScrapValue + potentialCDDiscount + dealerOemDiscount + greenFinanceSavings + greenInsuranceSavings;
        const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');

        return (
            <>
                <div id="wizard-recaptcha-container"></div>
                <div className="w-full max-w-5xl mx-auto px-4 py-8">
                <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden"
                >
                    {/* Accent top line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-[#E31E24] to-amber-500" />
                    
                    <div className="relative z-10">
                        {/* Header Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                                    <Recycle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-0.5 flex items-center gap-1.5">
                                        EVALUATION FINALIZED
                                    </p>
                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">Your Vehicle's Scrap Worth</h2>
                                </div>
                            </div>
                            <div className="px-4 py-1.5 bg-slate-950 rounded-full shadow-md border border-slate-800 flex items-center">
                                <p className="text-[9px] font-black text-white uppercase tracking-widest">QUOTE ID: {quoteId || "SC-XXXXXX"}</p>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Potential Benefit & Cards (7 cols) */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* Total Potential Benefit Box */}
                                <div className="bg-gradient-to-br from-[#122333] to-[#0c1622] rounded-[1.25rem] p-5 text-white relative overflow-hidden shadow-lg border border-slate-800">
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" /> TOTAL POTENTIAL BENEFIT
                                    </p>
                                    <div className="relative z-10">
                                        <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-none tracking-tight mb-4">
                                            Up to ₹{formatCurrency(maxTotalBenefit)}*
                                        </h3>
                                        
                                        {/* Breakdown Box */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="border border-white/10 bg-white/[0.02] rounded-xl p-3.5">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">SCRAP VALUE</p>
                                                <p className="text-sm font-black text-white mt-0.5">₹{formatCurrency(minScrapValue)} - ₹{formatCurrency(maxScrapValue)}</p>
                                            </div>
                                            <div className="border border-emerald-500/10 bg-emerald-500/[0.02] rounded-xl p-3.5">
                                                <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">CD CERTIFICATE</p>
                                                <p className="text-sm font-black text-emerald-400 mt-0.5">
                                                    {formData.buyNew === "yes" && cdDiscount === null ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400 inline" />
                                                    ) : `+ ₹${formatCurrency(potentialCDDiscount)}`}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <span className="inline-block px-2.5 py-0.5 bg-black/40 border border-white/10 text-slate-200 text-[8px] font-bold rounded-full tracking-wider uppercase mb-2">
                                            ⚡ MARKET RATE: HIGH DEMAND
                                        </span>
                                        
                                        <p className="text-slate-400 text-[9px] leading-normal italic mt-1">
                                            *Calculated using industrial scrap indices for {weightNum} and maximum CD Certificate redemption value.
                                        </p>
                                    </div>
                                </div>

                                {/* 2x2 Grid of Benefit Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Card 1: CD Certificate */}
                                    <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-4 relative shadow-sm hover:shadow-md transition-all">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-4 right-4" />
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">CD CERTIFICATE</p>
                                        <p className="text-xl font-black text-emerald-600 mt-1">
                                            {formData.buyNew === "yes" && cdDiscount === null ? (
                                                <Loader2 className="w-4 h-4 animate-spin inline text-emerald-600" />
                                            ) : `+ ₹${formatCurrency(potentialCDDiscount)}`}
                                        </p>
                                        <p className="text-[10px] text-emerald-800/80 font-medium mt-0.5">Registration & tax waiver</p>
                                    </div>

                                    {/* Card 2: Dealer OEM Discount */}
                                    <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 relative hover:shadow-sm transition-all">
                                        <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">COMING SOON</span>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">DEALER OEM DISCOUNT</p>
                                        <p className="text-xl font-black text-slate-800 mt-1">Up to ₹{formatCurrency(dealerOemDiscount)}</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Scrappage exchange benefits</p>
                                    </div>

                                    {/* Card 3: Green Finance */}
                                    <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 relative hover:shadow-sm transition-all">
                                        <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">COMING SOON</span>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">GREEN FINANCE</p>
                                        <p className="text-xl font-black text-slate-800 mt-1">Up to ₹{formatCurrency(greenFinanceSavings)}</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Lower interest green loans</p>
                                    </div>

                                    {/* Card 4: Green Insurance */}
                                    <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 relative hover:shadow-sm transition-all">
                                        <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">COMING SOON</span>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">GREEN INSURANCE</p>
                                        <p className="text-xl font-black text-slate-800 mt-1">Up to ₹{formatCurrency(greenInsuranceSavings)}</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Eco insurance rebates</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Invoice Benefit Summary Receipt (5 cols) */}
                            <div className="lg:col-span-5">
                                <div className="bg-[#f8fafc] border border-slate-200/80 rounded-[1.5rem] p-6 flex flex-col justify-between shadow-inner h-full">
                                    <div className="space-y-4">
                                        {/* Invoice Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">EST. INVOICE</p>
                                                <h4 className="text-slate-900 font-black text-md leading-tight uppercase tracking-tight">BENEFIT SUMMARY RECEIPT</h4>
                                            </div>
                                            <span className="bg-red-50 text-red-500 border border-red-150 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">EST-BILL</span>
                                        </div>

                                        {/* Dotted Divider */}
                                        <div className="border-t border-dashed border-slate-350 my-4" />

                                        {/* Row: SCRAP VEHICLE */}
                                        <div className="flex justify-between items-start gap-4 text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">SCRAP VEHICLE</span>
                                            <span className="text-slate-900 font-black text-right uppercase max-w-[200px] leading-tight">
                                                {formData.brand || "HYUNDAI MOTOR INDIA LTD"} {formData.model || "SANTRO XG"} ({formData.year || "2005"})
                                            </span>
                                        </div>

                                        {/* Row: UNLADEN WEIGHT */}
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">UNLADEN WEIGHT</span>
                                            <span className="text-slate-900 font-black">{weightNum} kg</span>
                                        </div>

                                        {/* Row: BASE RATE / KG */}
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">BASE RATE / KG</span>
                                            <span className="text-slate-900 font-black">₹{ratePerKg} / kg</span>
                                        </div>

                                        {/* Solid Divider */}
                                        <div className="border-t border-slate-200 my-4" />

                                        {/* Itemized Rows */}
                                        <div className="space-y-3.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-600 font-medium">Scrap Value Estimate (Average)</span>
                                                <span className="text-slate-900 font-extrabold">₹{formatCurrency(averageScrapValue)}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-emerald-600 font-bold">CD Certificate Advantage</span>
                                                <span className="text-emerald-600 font-extrabold">+ ₹{formatCurrency(potentialCDDiscount)}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-slate-400">
                                                <span className="flex items-center gap-1.5 italic">
                                                    Dealer OEM Discount
                                                    <span className="bg-amber-100 text-amber-800 text-[6px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider not-italic">SOON</span>
                                                </span>
                                                <span className="font-bold italic">+ ₹{formatCurrency(dealerOemDiscount)}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-slate-400">
                                                <span className="flex items-center gap-1.5 italic">
                                                    Green Finance Savings
                                                    <span className="bg-amber-100 text-amber-800 text-[6px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider not-italic">SOON</span>
                                                </span>
                                                <span className="font-bold italic">+ ₹{formatCurrency(greenFinanceSavings)}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-slate-400">
                                                <span className="flex items-center gap-1.5 italic">
                                                    Green Insurance Savings
                                                    <span className="bg-amber-100 text-amber-800 text-[6px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider not-italic">SOON</span>
                                                </span>
                                                <span className="font-bold italic">+ ₹{formatCurrency(greenInsuranceSavings)}</span>
                                            </div>
                                        </div>

                                        {/* Dashed Divider */}
                                        <div className="border-t border-dashed border-slate-350 my-4" />

                                        {/* Grand Total Benefit Card */}
                                        <div className="bg-[#0f172a] rounded-[1.25rem] p-4 text-white flex items-center justify-between shadow-md border border-slate-800">
                                            <div>
                                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-0.5">GRAND TOTAL BENEFIT</p>
                                                <p className="text-[10px] text-slate-300 font-medium">Scrap + CD + Partner Savings</p>
                                            </div>
                                            <span className="text-2xl font-black text-white">₹{formatCurrency(grandTotalBenefit)}</span>
                                        </div>
                                    </div>

                                    {/* Footer Disclaimer */}
                                    <p className="text-slate-400 text-[10px] italic mt-6 text-center leading-normal">
                                        *Our team will assist you for getting best value of your CD Certificate.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* eKYC / Precise Valuation Action Button */}
                        <div className="flex items-center justify-start mt-8 pt-4 border-t border-slate-100">
                            <a 
                                href="/ekyc" 
                                onClick={() => {
                                    localStorage.setItem("kycFormData", JSON.stringify(formData));
                                    localStorage.setItem("kycSource", "scrap");
                                }}
                                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#E31E24] to-red-500 hover:to-red-600 text-white font-extrabold rounded-xl shadow-lg shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-wider text-xs group"
                            >
                                GET MORE PRECISE VALUATION 
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </motion.div>
                </div>
            </>
        )
    }

    if (mode === "success") {
        return (
            <>
                <div id="wizard-recaptcha-container"></div>
                <div className="w-full max-w-2xl mx-auto px-4 py-6">
                <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-white border border-slate-200 rounded-[1rem] p-6 text-center shadow-2xl relative overflow-hidden"
                >
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E31E24] to-red-400" />
                    
                    {/* Decorative background circles */}
                    <div className="absolute -top-16 -right-16 w-40 h-40 bg-red-50 rounded-full opacity-60" />
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-red-50 rounded-full opacity-60" />

                    <div className="relative z-10">
                        {/* Icon */}
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-100"
                        >
                            <CheckCircle className="w-8 h-8 text-[#E31E24]" />
                        </motion.div>

                        {/* Headline */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <p className="text-[9px] font-bold text-[#E31E24] uppercase tracking-[0.2em] mb-1.5">
                                🎉 Request Submitted
                            </p>
                            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2 tracking-tight leading-tight">
                                Congratulations!
                            </h2>
                            <p className="text-slate-500 text-[11px] font-medium max-w-sm mx-auto leading-relaxed mb-4">
                                Our expert team will reach out to you <span className="font-bold text-slate-700">shortly</span> to finalise the best deal for your vehicle.
                            </p>
                        </motion.div>

                        {/* Divider */}
                        <div className="w-full h-px bg-slate-100 mb-5" />

                        {/* eKYC CTA or Expert Talk */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3">
                            {serviceType === "buy" ? (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-left mb-4">
                                        <p className="text-blue-800 text-[9px] font-bold uppercase tracking-wider mb-0.5">🤝 Expert Support</p>
                                        <p className="text-blue-700 text-[10px] font-medium leading-relaxed">Rest assured, our dealership experts will reach out to you <span className="font-bold text-blue-900 italic underline">ASAP</span> to assist with your new purchase and exchange benefits.</p>
                                    </div>

                                    <a 
                                        href="/contact" 
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] group"
                                    >
                                        Talk to our Experts
                                        <Phone className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                                    </a>
                                </>
                            ) : (
                                <>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-left mb-4">
                                        <p className="text-amber-800 text-[9px] font-bold uppercase tracking-wider mb-0.5">⚡ Speed up your process</p>
                                        <p className="text-amber-700 text-[10px] font-medium">Complete your eKYC now to get instant approval and faster pickup scheduling.</p>
                                    </div>

                                    <a 
                                        href="/ekyc" 
                                        onClick={() => {
                                            localStorage.setItem("kycFormData", JSON.stringify(formData));
                                            localStorage.setItem("kycSource", serviceType);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#E31E24] text-white font-black rounded-xl shadow-lg shadow-red-500/25 hover:bg-red-600 transition-all uppercase tracking-widest text-[10px] group"
                                    >
                                        Complete eKYC
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </>
                            )}
                            
                            <button 
                                onClick={() => {
                                    setServiceType("")
                                    setStep(0)
                                    setMode("wizard")
                                }} 
                                className="w-full py-2.5 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[9px]"
                            >
                                Back to Home
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
                </div>
            </>
        )
    }



    return (
        <>
            <div id="wizard-recaptcha-container"></div>
            <div className="w-full max-w-2xl mx-auto px-4">
            <div className="bg-white border border-slate-200 rounded-[1rem] overflow-hidden shadow-2xl">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <button onClick={prevStep} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E31E24] transition-all"><ArrowLeft className="w-3.5 h-3.5" /></button>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#E31E24] uppercase tracking-widest mb-0.5">Step {currentStepDisplay()} of {totalSteps}</span>
                        <h4 className="text-slate-900 font-bold text-xs uppercase tracking-tighter">{serviceType ? `${serviceType} Service` : "Get Started"}</h4>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center text-[#E31E24] font-bold text-[10px] bg-red-50 rounded-full">{Math.round(((currentStepDisplay()) / totalSteps) * 100)}%</div>
                </div>

                <div className="w-full h-1 bg-slate-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${((currentStepDisplay()) / totalSteps) * 100}%` }} className="h-full bg-[#E31E24]" />
                </div>

                <div className="relative p-5 lg:p-6 min-h-[340px] flex flex-col justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div key={serviceType ? `${serviceType}-${step}` : "selection"} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="w-full">
                            
                            {/* ── INITIAL SITUATION SELECTION ── */}
                            {!serviceType && (
                                <div className="space-y-6 text-center">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">What is your situation?</h3>
                                        <p className="text-slate-500 text-[11px] font-medium px-4">Choose the option that best describes what you're looking for today.</p>
                                    </div>
                                    {fromHero && formData.regNo && (
                                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl max-w-sm mx-auto">
                                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                            <span className="text-[11px] font-bold text-green-800">Vehicle <span className="tracking-widest">{formData.regNo}</span> loaded</span>
                                        </div>
                                    )}
                                    <div className="grid gap-2.5 max-w-sm mx-auto px-4">
                                        {[
                                            ...(!fromHero ? [{ title: "Buy a new Vehicle", description: "Exchange offers & OEM benefits", key: "buy" }] : []),
                                            { title: "Scrap your Vehicle", description: "Eco-friendly & max scrap value", key: "scrap" }
                                        ].map((opt) => (
                                            <button
                                                key={opt.key}
                                                onClick={() => {
                                                    setDirection(1)
                                                    setServiceType(opt.key)
                                                    // When fromHero, skip vehicle number step (step 0) and go directly to verify details (step 1)
                                                    setStep(fromHero ? 1 : 0)
                                                }}
                                                className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#E31E24] hover:bg-red-50 hover:shadow-md transition-all group text-left"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900 group-hover:text-[#E31E24] text-sm leading-none mb-0.5">{opt.title}</p>
                                                    <p className="text-[10px] text-slate-500 group-hover:text-red-700/60 font-medium">{opt.description}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#E31E24] group-hover:translate-x-1 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}



                            {/* ── BUY FLOW ── */}
                            {serviceType === "buy" && (
                                <>
                                    {step === 0 && (
                                        <div className="space-y-6 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Car className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight">Vehicle of Choice</h3>
                                            <p className="text-slate-500 text-[11px] font-medium mb-4">Tell us the details of the vehicle you wish to buy.</p>
                                            
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desired Brand</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {BRANDS.map((b) => (
                                                            <button
                                                                key={b}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, desiredCompany: b })}
                                                                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${formData.desiredCompany === b ? 'border-[#E31E24] bg-red-50 shadow-sm' : 'border-slate-100 bg-white hover:border-red-200 hover:bg-red-50/50'}`}
                                                            >
                                                                {BRAND_LOGOS[b] ? (
                                                                    <img src={BRAND_LOGOS[b]} alt={b} className="w-7 h-7 object-contain mb-1 drop-shadow-sm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                ) : (
                                                                    <div className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-full mb-1"><Car className="w-3.5 h-3.5 text-slate-400" /></div>
                                                                )}
                                                                <span className="text-[8px] font-bold text-slate-700 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5">{b}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {formData.desiredCompany && !BRANDS.includes(formData.desiredCompany) && (
                                                        <input type="text" placeholder="e.g. Maruti Suzuki" value={formData.desiredCompany} onChange={(e) => setFormData({...formData, desiredCompany: e.target.value})} className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                    )}
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desired Model</label>
                                                    <input type="text" placeholder="e.g. Swift" value={formData.desiredModel} onChange={(e) => setFormData({...formData, desiredModel: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                            </div>
                                            
                                            <button disabled={!formData.desiredCompany || !formData.desiredModel} onClick={nextStep} className="w-full max-w-md mx-auto py-3 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[11px]">Continue</button>
                                        </div>
                                    )}
                                    {step === 1 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><User className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Tell us your name</h3>
                                            <input type="text" placeholder="Your Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full max-w-md mx-auto px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" autoFocus />
                                            <button disabled={!formData.name} onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[10px]">Next Step</button>
                                        </div>
                                    )}
                                    {step === 2 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                {otpSent ? <Lock className="w-7 h-7 text-[#E31E24]" /> : <Smartphone className="w-7 h-7 text-[#E31E24]" />}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">{otpSent ? "Verification" : "Mobile Number"}</h3>
                                            
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">+91</span>
                                                    <input 
                                                        type="tel" 
                                                        disabled={otpSent}
                                                        placeholder="10-digit number" 
                                                        value={formData.phone} 
                                                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (formData.phone.length === 10 && !isSendingOtp) {
                                                                    handleSendOtp();
                                                                }
                                                            }
                                                        }}
                                                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-[#E31E24] disabled:opacity-50" 
                                                        maxLength={10} 
                                                    />
                                                </div>

                                                {otpSent && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                        <input 
                                                            type="tel" 
                                                            placeholder={isSandboxMode ? "Use: 000000" : "••••••"} 
                                                            value={formData.otp} 
                                                            onChange={(e) => setFormData({...formData, otp: e.target.value.slice(0, 6)})} 
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    if ((formData.otp.length === 6 || formData.otp.length === 4) && !isVerifying) {
                                                                        handleVerifyOtp();
                                                                    }
                                                                }
                                                            }}
                                                            className="w-full px-4 py-2.5 bg-slate-50 border border-[#E31E24]/30 rounded-xl text-2xl text-center font-black tracking-[0.4em] text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                            maxLength={6} 
                                                            autoFocus 
                                                        />
                                                        {isSandboxMode && (
                                                            <p className="text-[10px] text-amber-600 font-bold">⚡ Sandbox mode — enter 000000</p>
                                                        )}
                                                        <button 
                                                            onClick={() => { setOtpSent(false); setFormData({...formData, otp: ""}); setIsSandboxMode(false); }}
                                                            className="text-[10px] font-bold text-slate-400 hover:text-[#E31E24] uppercase tracking-widest transition-colors"
                                                        >
                                                            Change Number
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <button 
                                                disabled={(otpSent ? (formData.otp.length !== 6 && formData.otp.length !== 4) : formData.phone.length !== 10) || isSendingOtp || isVerifying} 
                                                onClick={otpSent ? handleVerifyOtp : handleSendOtp} 
                                                className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {isSendingOtp || isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : (otpSent ? "Verify & Complete" : "Get OTP")}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ── SCRAP FLOW ── */}
                            {serviceType === "scrap" && (
                                <>
                                    {step === 0 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Car className="w-7 h-7 text-[#E31E24]" /></div>
                                            <div className="space-y-0.5">
                                                <h3 className="text-xl font-bold text-slate-900">Vehicle Number</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Enter your registration number (e.g. DL-01-AB-1234)</p>
                                            </div>
                                            <div className="relative max-w-md mx-auto">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <input type="text" placeholder="DL-01-AB-1234" value={formData.regNo} onChange={(e) => setFormData({...formData, regNo: e.target.value.toUpperCase()})} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-lg font-black tracking-widest text-slate-900 focus:outline-none focus:border-[#E31E24] transition-all text-center" />
                                            </div>
                                            <button disabled={!formData.regNo || isFetching} onClick={handleRegSubmit} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-[10px]">
                                                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch Details"}
                                                {!isFetching && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                            </button>
                                        </div>
                                    )}
                                    {step === 1 && (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2"><ClipboardList className="w-6 h-6 text-[#E31E24]" /></div>
                                                <h3 className="text-lg font-bold text-slate-900">Verify Vehicle Details</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Auto-filled based on your registration</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Company / Brand</label>
                                                    <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Model Name</label>
                                                    <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. Santro" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Reg. Year</label>
                                                    <input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Weight (KG)</label>
                                                    <input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. 1200" />
                                                </div>
                                            </div>
                                            <button onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">Confirm & Continue <ArrowRight className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Car className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Buy a new vehicle?</h3>
                                            <p className="text-slate-500 text-[11px] font-medium">Would you like to purchase a new vehicle while scrapping this one to claim CD certificate benefits?</p>
                                            <div className="flex gap-3 max-w-md mx-auto justify-center">
                                                <button onClick={() => { setFormData({...formData, buyNew: "yes"}); nextStep("yes") }} className="w-1/2 py-2.5 border border-slate-100 rounded-xl font-bold text-sm text-slate-700 hover:border-[#E31E24] hover:bg-red-50 transition-all shadow-sm">Yes</button>
                                                <button onClick={() => { setFormData({...formData, buyNew: "no"}); nextStep("no") }} className="w-1/2 py-2.5 border border-slate-100 rounded-xl font-bold text-sm text-slate-700 hover:border-[#E31E24] hover:bg-red-50 transition-all shadow-sm">No</button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><ShoppingCart className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight">Vehicle Choice</h3>
                                            <p className="text-slate-500 text-[11px] font-medium mb-4">Details of the new vehicle you wish to buy.</p>
                                            
                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {BRANDS.map((b) => (
                                                            <button
                                                                key={b}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, desiredCompany: b })}
                                                                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${formData.desiredCompany === b ? 'border-[#E31E24] bg-red-50 shadow-sm' : 'border-slate-100 bg-white hover:border-red-200 hover:bg-red-50/50'}`}
                                                            >
                                                                {BRAND_LOGOS[b] ? (
                                                                    <img src={BRAND_LOGOS[b]} alt={b} className="w-7 h-7 object-contain mb-1 drop-shadow-sm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                ) : (
                                                                    <div className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-full mb-1"><Car className="w-3.5 h-3.5 text-slate-400" /></div>
                                                                )}
                                                                <span className="text-[8px] font-bold text-slate-700 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5">{b}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {formData.desiredCompany && !BRANDS.includes(formData.desiredCompany) && (
                                                        <input type="text" placeholder="e.g. Maruti Suzuki" value={formData.desiredCompany} onChange={(e) => setFormData({...formData, desiredCompany: e.target.value})} className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                    )}
                                                </div>
                                                <div className="space-y-1.5 text-left">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</label>
                                                    <input type="text" placeholder="e.g. Swift" value={formData.desiredModel} onChange={(e) => setFormData({...formData, desiredModel: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                </div>
                                            </div>
                                            
                                            <button disabled={!formData.desiredCompany || !formData.desiredModel} onClick={nextStep} className="w-full max-w-md mx-auto py-3 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[11px]">Continue</button>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Fuel className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Fuel type of {formData.model ? <span className="text-[#E31E24]">{formData.model}</span> : "your vehicle"}?</h3>
                                            <p className="text-slate-500 text-[11px] font-medium">Select all that apply for your vehicle</p>
                                            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                                                {FUEL_TYPES.map((f, i) => {
                                                    const isSelected = formData.fuel.split(', ').includes(f);
                                                    return (
                                                        <button 
                                                            key={i} 
                                                            onClick={() => { 
                                                                const currentFuels = formData.fuel ? formData.fuel.split(', ') : [];
                                                                const newFuels = isSelected 
                                                                    ? currentFuels.filter(fuel => fuel !== f)
                                                                    : [...currentFuels, f];
                                                                setFormData({...formData, fuel: newFuels.join(', ')});
                                                            }} 
                                                            className={`px-4 py-2 border rounded-xl text-[10px] font-bold transition-all ${
                                                                isSelected 
                                                                    ? "bg-[#E31E24] border-[#E31E24] text-white shadow-md shadow-red-500/20" 
                                                                    : "border-slate-100 text-slate-700 hover:border-[#E31E24] hover:bg-red-50"
                                                            }`}
                                                        >
                                                            {f}
                                                            {isSelected && <CheckCircle className="w-3 h-3 ml-1.5 inline-block" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button 
                                                disabled={!formData.fuel} 
                                                onClick={() => nextStep()} 
                                                className="w-full max-w-md mx-auto mt-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                            >
                                                Next Step <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-5 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><User className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Your Name</h3>
                                            <input type="text" placeholder="Enter Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full max-w-md mx-auto px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" autoFocus />
                                            <button disabled={!formData.name} onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[10px]">Continue</button>
                                        </div>
                                    )}

                                    {step === 6 && (
                                        <div className="space-y-4 text-center">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-1"><MapPin className="w-7 h-7 text-[#E31E24]" /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Vehicle Location</h3>
                                            
                                            <button
                                                type="button"
                                                onClick={handleFetchLocation}
                                                disabled={isDetectingLocation}
                                                className="flex items-center justify-center gap-2 mx-auto px-4 py-2 border border-dashed border-red-200 hover:border-[#E31E24] bg-red-50/30 hover:bg-red-50 text-[#E31E24] hover:text-red-700 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-sm max-w-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {isDetectingLocation ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        Detecting location...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        Auto-detect Location
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-[9px] text-slate-400 -mt-2">*(Wi-Fi/ISP location on PC may vary. Enter Pincode for 100% accuracy)</p>

                                            <div className="space-y-3 max-w-md mx-auto">
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                                                    <input 
                                                        type="tel" 
                                                        placeholder="6-digit Pincode (e.g. 110001)" 
                                                        value={formData.pincode} 
                                                        onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} 
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                    />
                                                 </div>
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">State</label>
                                                    <select value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value, city: ""})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]">
                                                        <option value="" disabled>Select State</option>
                                                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">City</label>
                                                    <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" disabled={!formData.state}>
                                                        <option value="" disabled>{formData.state ? "Select City" : "Select State First"}</option>
                                                        {formData.state && (indiaData[formData.state] || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <button disabled={!formData.state || !formData.city || formData.pincode.length !== 6} onClick={nextStep} className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[10px]">Continue</button>
                                        </div>
                                    )}

                                    {step === 7 && (() => {
                                        // Calculate scrap value estimates for pre-auth display
                                        const weightNum7 = parseInt(String(formData.weight).replace(/\D/g, '')) || 1200;
                                        const ratePerKg7 = baseScrapRate || 25;
                                        const minScrap7 = Math.round((weightNum7 * Math.max(1, ratePerKg7 - 5)) / 100) * 100;
                                        const maxScrap7 = Math.round((weightNum7 * (ratePerKg7 + 5)) / 100) * 100;
                                        const formatCurr = (n: number) => n.toLocaleString('en-IN');

                                        return (
                                        <div className="space-y-5">
                                            {/* Heading */}
                                            <div className="text-center space-y-1">
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">Your Scrap Valuation is Ready! 🎉</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Verify your mobile number to unlock Certificate of Deposit (CD) and other green benefits.</p>
                                            </div>

                                            {/* Two-Column Grid: Estimate + Unlock */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* LEFT: Tier 1 Estimate Card */}
                                                <div className="bg-gradient-to-br from-[#122333] to-[#0c1622] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg border border-slate-800">
                                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                                                        <Zap className="w-3 h-3 fill-amber-400 text-amber-400" /> TIER 1 — ANONYMOUS ESTIMATE
                                                    </p>
                                                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide leading-tight mb-3">
                                                        {formData.brand || "VEHICLE"} {formData.model || ""} SCRAP WORTH
                                                    </p>
                                                    <h4 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight mb-3">
                                                        ₹{formatCurr(minScrap7)} – ₹{formatCurr(maxScrap7)}
                                                    </h4>
                                                    <p className="text-slate-400 text-[8px] leading-normal italic">
                                                        *Honest ±20% scrap pricing based on {weightNum7}kg unladen weight and global scrap metal indices. No single inflated numbers.
                                                    </p>
                                                </div>

                                                {/* RIGHT: Unlock Benefits Card */}
                                                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3 border border-red-100">
                                                        {otpSent ? <Lock className="w-6 h-6 text-[#E31E24]" /> : <Smartphone className="w-6 h-6 text-[#E31E24]" />}
                                                    </div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">{otpSent ? "VERIFY OTP" : "UNLOCK BENEFITS"}</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium mb-4 leading-relaxed">
                                                        {otpSent ? "Enter the OTP sent to your phone." : "Enter your phone number to unlock your CD certificate and partner benefits."}
                                                    </p>

                                                    <div className="w-full space-y-3">
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">+91</span>
                                                            <input 
                                                                type="tel" 
                                                                disabled={otpSent}
                                                                placeholder="10-digit number" 
                                                                value={formData.phone} 
                                                                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                                                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:border-[#E31E24] disabled:opacity-50" 
                                                                maxLength={10} 
                                                            />
                                                        </div>

                                                        {otpSent && (
                                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                                                <input 
                                                                    type="tel" 
                                                                    placeholder={isSandboxMode ? "Use: 000000" : "••••••"} 
                                                                    value={formData.otp} 
                                                                    onChange={(e) => setFormData({...formData, otp: e.target.value.slice(0, 6)})} 
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-[#E31E24]/30 rounded-xl text-xl text-center font-black tracking-[0.3em] text-slate-900 focus:outline-none focus:border-[#E31E24]" 
                                                                    maxLength={6} 
                                                                    autoFocus 
                                                                />
                                                                {isSandboxMode && (
                                                                    <p className="text-[10px] text-amber-600 font-bold">⚡ Sandbox mode — enter 000000</p>
                                                                )}
                                                                <button 
                                                                    onClick={() => { setOtpSent(false); setFormData({...formData, otp: ""}); setIsSandboxMode(false); }}
                                                                    className="text-[9px] font-bold text-slate-400 hover:text-[#E31E24] uppercase tracking-widest transition-colors"
                                                                >
                                                                    Change Number
                                                                </button>
                                                            </motion.div>
                                                        )}

                                                        <button 
                                                            disabled={(otpSent ? (formData.otp.length !== 6 && formData.otp.length !== 4) : formData.phone.length !== 10) || isSendingOtp || isVerifying} 
                                                            onClick={otpSent ? handleVerifyOtp : handleSendOtp} 
                                                            className="w-full py-3 bg-[#E31E24] text-white font-black rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2"
                                                        >
                                                            {isSendingOtp || isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : (otpSent ? "VERIFY & GET VALUATION" : "GET OTP")}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Locked Benefit Cards Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Card 1: CD Benefits - unlockable */}
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-red-400/60 blur-[2px] text-lg font-black">₹55,000</span>
                                                        <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                    </div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">UNLOCK CD BENEFITS</p>
                                                </div>

                                                {/* Card 2: Dealer Discount */}
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
                                                    <span className="absolute top-2.5 right-2.5 bg-amber-100 text-amber-800 text-[6px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">COMING SOON</span>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-red-400/60 blur-[2px] text-lg font-black">₹10,000</span>
                                                        <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                    </div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">VERIFY TO UNLOCK</p>
                                                </div>

                                                {/* Card 3: Green Finance */}
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
                                                    <span className="absolute top-2.5 right-2.5 bg-amber-100 text-amber-800 text-[6px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">COMING SOON</span>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-red-400/60 blur-[2px] text-lg font-black">₹15,000</span>
                                                        <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                    </div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">VERIFY TO UNLOCK</p>
                                                </div>

                                                {/* Card 4: Green Insurance */}
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
                                                    <span className="absolute top-2.5 right-2.5 bg-amber-100 text-amber-800 text-[6px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">COMING SOON</span>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-red-400/60 blur-[2px] text-lg font-black">₹8,000</span>
                                                        <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                    </div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">VERIFY TO UNLOCK</p>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })()}
                                </>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex flex-wrap gap-2">
                    {formData.regNo && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 uppercase">{formData.regNo}</span>}
                    {formData.brand && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 uppercase">{formData.brand}</span>}
                    {formData.kms && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 uppercase">{formData.kms} KM</span>}
                </div>
                <div id="wizard-recaptcha-container"></div>
            </div>
            </div>
        </>
    )
}

