"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Car, Recycle, ShoppingCart, ArrowRight, ArrowLeft,
    Zap, Shield, Sparkles, CheckCircle, Search,
    MapPin, Calendar, User, Phone, ClipboardList,
    Smartphone, Lock, Fuel, Gauge, Home, Loader2,
    Camera, UploadCloud
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getFirebaseAuth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"
import { lookupVehicle } from "@/app/actions"


import { indiaData, states as STATES } from "@/lib/india-data"

// ─── Data Definitions ─────────────────────────────────────────────────────────

const BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Honda", "Kia", "Skoda", "Volkswagen", "MG", "Nissan", "Renault", "Other"]

const BRAND_MODELS: Record<string, string[]> = {
    "Maruti Suzuki": ["Swift", "Baleno", "Brezza", "WagonR", "Dzire", "Ertiga", "Alto", "Celerio", "Grand Vitara", "Other"],
    "Hyundai": ["Creta", "i20", "Venue", "Grand i10 Nios", "Verna", "Exter", "Alcazar", "Tucson", "Other"],
    "Tata": ["Nexon", "Punch", "Harrier", "Safari", "Tiago", "Altroz", "Tigor", "Curvv", "Other"],
    "Mahindra": ["Thar", "XUV700", "Scorpio-N", "Scorpio Classic", "Bolero", "XUV3XO", "Thar Roxx", "XUV400", "Other"],
    "Toyota": ["Innova Crysta", "Innova Hycross", "Fortuner", "Glanza", "Urban Cruiser Taisor", "Hilux", "Camry", "Other"],
    "Honda": ["City", "Amaze", "Elevate", "City Hybrid", "Other"],
    "Kia": ["Seltos", "Sonet", "Carens", "EV6", "Carnival", "Other"],
    "Skoda": ["Kushaq", "Slavia", "Kodiaq", "Superb", "Other"],
    "Volkswagen": ["Taigun", "Virtus", "Tiguan", "Other"],
    "MG": ["Hector", "Astor", "ZS EV", "Comet EV", "Gloster", "Other"],
    "Nissan": ["Magnite", "Kicks", "Other"],
    "Renault": ["Kwid", "Triber", "Kiger", "Other"]
}

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
    const fuels: string[] = [];
    if (cleanFuel.includes("PETROL")) fuels.push("Petrol");
    if (cleanFuel.includes("DIESEL")) fuels.push("Diesel");
    if (cleanFuel.includes("CNG") || cleanFuel.includes("LPG")) fuels.push("CNG");
    if (cleanFuel.includes("ELECTRIC") || cleanFuel.includes("EV")) fuels.push("Electric");
    if (cleanFuel.includes("HYBRID")) fuels.push("Hybrid");

    if (fuels.length > 0) return fuels.join(", ");
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

const triggerConfetti = (durationSeconds: number) => {
    if (typeof window === "undefined") return;
    const duration = durationSeconds * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
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

    // Brand & Model selection states
    const [selectedBrand, setSelectedBrand] = useState("")
    const [selectedModel, setSelectedModel] = useState("")
    const [customBrand, setCustomBrand] = useState("")
    const [customModel, setCustomModel] = useState("")

    useEffect(() => {
        setQuoteId("SC-" + Math.random().toString(36).substr(2, 6).toUpperCase())
    }, [])

    useEffect(() => {
        if (serviceType === "scrap" && step === 8) {
            triggerConfetti(2);
        }
    }, [step, serviceType]);

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
        city: "",
        carPhoto: "",
        ownerName: ""
    })

    // Sync desiredCompany & desiredModel selection states with form data
    useEffect(() => {
        if (formData.desiredCompany) {
            if (BRANDS.includes(formData.desiredCompany)) {
                if (selectedBrand !== formData.desiredCompany) {
                    setSelectedBrand(formData.desiredCompany);
                }
            } else {
                if (selectedBrand !== "Other") {
                    setSelectedBrand("Other");
                }
                if (customBrand !== formData.desiredCompany) {
                    setCustomBrand(formData.desiredCompany);
                }
            }
        }
        if (formData.desiredModel) {
            const modelsList = formData.desiredCompany ? BRAND_MODELS[formData.desiredCompany] : [];
            if (modelsList && modelsList.includes(formData.desiredModel)) {
                if (selectedModel !== formData.desiredModel) {
                    setSelectedModel(formData.desiredModel);
                }
            } else {
                if (selectedModel !== "Other") {
                    setSelectedModel("Other");
                }
                if (customModel !== formData.desiredModel) {
                    setCustomModel(formData.desiredModel);
                }
            }
        }
    }, [formData.desiredCompany, formData.desiredModel, selectedBrand, selectedModel, customBrand, customModel]);

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
                fuel: data.fuel || "",
                ownerName: data.ownerName || "",
                name: data.name || data.ownerName || prev.name || "",
                address: data.address || "",
                pincode: data.pincode || prev.pincode
            }))
            setFromHero(true)
            setServiceType("scrap") // Bypasses Situation selection and directly sets to scrap flow
            setStep(1)              // Directly opens step 1: Verify Vehicle Details
            setMode("wizard")
        }
        window.addEventListener('hero-vehicle-data', handleHeroData as EventListener)
        return () => window.removeEventListener('hero-vehicle-data', handleHeroData as EventListener)
    }, [])

    // Listen for "buy a new vehicle" click from Hero section
    useEffect(() => {
        const handleHeroBuyClick = () => {
            setFromHero(false)
            setServiceType("buy")
            setStep(0)
            setDirection(1)
            setMode("wizard")
        }
        window.addEventListener('hero-buy-click', handleHeroBuyClick as EventListener)
        return () => window.removeEventListener('hero-buy-click', handleHeroBuyClick as EventListener)
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
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingImage(true)
        const uploadData = new FormData()
        uploadData.append("file", file)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            })

            if (!res.ok) {
                throw new Error("Failed to upload image")
            }

            const data = await res.json()
            if (data.success && data.url) {
                setFormData(prev => ({ ...prev, carPhoto: data.url }))
                toast({
                    title: "Image Uploaded",
                    description: "Your vehicle image has been successfully uploaded to Cloudinary.",
                })
            } else {
                throw new Error(data.message || "Upload failed")
            }
        } catch (err: any) {
            console.error("Error uploading image:", err)
            toast({
                title: "Upload Failed",
                description: err.message || "Could not upload image. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsUploadingImage(false)
        }
    }

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
        if (formData.buyNew === "yes" && formData.desiredCompany && formData.desiredModel && !cdDiscount && !isFetchingPrice) {
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
    }, [formData.buyNew, formData.desiredCompany, formData.desiredModel, cdDiscount, isFetchingPrice])

    // Scrap valuation calculations (shared between step 7 pre-auth and final page)
    const weightNum = parseInt(String(formData.weight).replace(/\D/g, '')) || 1200;
    const ratePerKg = baseScrapRate || 25;

    // Scrap value estimates
    const averageScrapValue = weightNum * ratePerKg;
    const minScrapValue = Math.round((weightNum * Math.max(1, ratePerKg - 5)) / 100) * 100;
    const maxScrapValue = Math.round((weightNum * (ratePerKg + 5)) / 100) * 100;

    // CD certificate value
    const potentialCDDiscount = (serviceType === "scrap" && formData.buyNew === "no") ? 0 : (cdDiscount !== null ? cdDiscount : 55000);

    // Totals
    const maxTotalBenefit = maxScrapValue + potentialCDDiscount;
    const dealerOemDiscount = 10000;
    const greenFinanceSavings = 15000;
    const greenInsuranceSavings = 8000;

    const grandTotalBenefit = averageScrapValue + potentialCDDiscount + dealerOemDiscount + greenFinanceSavings + greenInsuranceSavings;
    const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');

    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
    const [otpSent, setOtpSent] = useState(false)
    const [isSandboxMode, setIsSandboxMode] = useState(false)

    const getOrCreateRecaptcha = (): RecaptchaVerifier => {
        if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current
        const verifier = new RecaptchaVerifier(getFirebaseAuth(), 'wizard-recaptcha-container', {
            size: 'invisible',
            callback: () => { },
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
        setSelectedBrand("")
        setSelectedModel("")
        setCustomBrand("")
        setCustomModel("")
        setFormData({
            regNo: "", brand: "", model: "", year: "", weight: "", kms: "", fuel: "", name: "", address: "", phone: "", otp: "", desiredCompany: "", desiredModel: "", buyNew: "", pincode: "", state: "", city: "", carPhoto: "", ownerName: ""
        })
    }

    const nextStep = (overrideBuyNew?: string | React.MouseEvent) => {
        setDirection(1)
        const buyNewState = (overrideBuyNew && typeof overrideBuyNew === "string") ? overrideBuyNew : formData.buyNew;
        // In Scrap flow, if at 'Buy New' step (step 2) and user says 'no', skip 'Desired Brand/Model' (step 3) and go to Vehicle Location (now step 4)
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
            setStep(2) // Back to Buy New step
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
        const startTime = Date.now();
        try {
            const rawData = await lookupVehicle(formData.regNo);
            if (rawData.error) {
                throw new Error(rawData.error);
            }

            const data = rawData?.data?.client_id ? rawData.data : rawData;
            const addressString = data.present_address || data.permanent_address || "";
            const pincodeMatch = addressString.match(/\b\d{6}\b/);
            const pincode = pincodeMatch ? pincodeMatch[0] : "";

            setFormData(prev => ({
                ...prev,
                brand: data.maker_description || data.maker_name || data.maker || data.rc_maker || "",
                model: data.model_description || data.model_name || data.maker_model || data.model || data.rc_model || data.rc_model_name || "",
                year: data.registration_date ? data.registration_date.split('-')[0] : data.manufacturing_year || "",
                weight: data.vehicle_weight || data.unladen_weight || "",
                fuel: normalizeFuelType(data.fuel_type) || prev.fuel,
                ownerName: data.owner_name || data.owner || "",
                name: data.owner_name || data.owner || prev.name || "",
                address: addressString,
                pincode: pincode || prev.pincode
            }))

            toast({
                title: "Details Fetched",
                description: "We've auto-filled the vehicle info for you."
            })

            // Enforce minimum 2-second delay for the loading animation
            const elapsed = Date.now() - startTime;
            if (elapsed < 2000) {
                await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
            }

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

            // Enforce minimum 2-second delay for the loading animation
            const elapsed = Date.now() - startTime;
            if (elapsed < 2000) {
                await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
            }

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
            const confirmation = await signInWithPhoneNumber(getFirebaseAuth(), formattedPhone, verifier)
            setConfirmationResult(confirmation)
            setIsSandboxMode(false)
            setOtpSent(true)
            toast({
                title: "OTP Sent",
                description: "Please check your phone for the verification code.",
            })
        } catch (err: any) {
            recaptchaVerifierRef.current = null
            if (process.env.NODE_ENV === "production") {
                console.error("Firebase SMS failed in production:", err)
                toast({
                    title: "Failed to Send OTP",
                    description: err.message || "Failed to send verification code. Please verify your phone number and try again.",
                    variant: "destructive"
                })
            } else {
                // Gracefully fall back to Sandbox Mode (works when Firebase is not configured)
                console.warn("Firebase SMS failed, switching to Sandbox Mode:", err.message)
                setIsSandboxMode(true)
                setOtpSent(true)
                toast({
                    title: "OTP Ready",
                    description: "Use verification code 000000 to continue.",
                })
            }
        } finally {
            setIsSendingOtp(false)
        }
    }

    const submitLeadData = async () => {
        try {
            // Clean up data before sending to route validator
            const cleanData: any = { ...formData, serviceType };

            // Fallback for name since "Your Name" step is removed
            if (!cleanData.name) {
                cleanData.name = cleanData.ownerName || "Customer";
            }

            // Delete empty optional strings or format them
            if (cleanData.pincode === "") delete cleanData.pincode;
            if (cleanData.regNo === "") delete cleanData.regNo;

            if (cleanData.year === "") {
                delete cleanData.year;
            } else if (cleanData.year) {
                const yrNum = parseInt(cleanData.year, 10);
                if (!isNaN(yrNum)) {
                    cleanData.year = yrNum;
                } else {
                    delete cleanData.year;
                }
            }

            if (cleanData.kms === "") {
                delete cleanData.kms;
            } else if (cleanData.kms) {
                const kmsNum = parseFloat(cleanData.kms);
                if (!isNaN(kmsNum)) {
                    cleanData.kms = kmsNum;
                } else {
                    delete cleanData.kms;
                }
            }

            if (cleanData.weight === "") {
                delete cleanData.weight;
            } else if (cleanData.weight) {
                const wtNum = parseFloat(cleanData.weight);
                if (!isNaN(wtNum)) {
                    cleanData.weight = wtNum;
                }
            }

            // Remove empty values from other string fields
            const optionalFields = ["brand", "model", "address", "city", "state", "buyNew", "desiredCompany", "desiredModel", "carPhoto", "ownerName"];
            optionalFields.forEach(f => {
                if (cleanData[f] === "") delete cleanData[f];
            });

            const res = await fetch('/api/wizard-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanData)
            });
            if (!res.ok) {
                let errMsg = `wizard-lead returned status ${res.status}`;
                try {
                    const errData = await res.json();
                    if (errData && errData.error) errMsg = errData.error;
                } catch (e) { }
                throw new Error(errMsg);
            }
            const ct = res.headers.get("content-type");
            if (!ct || !ct.includes("application/json")) throw new Error("wizard-lead response was not JSON");

            const data = await res.json();
            if (data && data.lead && data.lead._id) {
                localStorage.setItem("kycValuationId", data.lead._id);
            }
        } catch (error) {
            console.error("Failed to save lead data:", error);
            throw error;
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
            triggerConfetti(4);
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
    const totalSteps = (!serviceType ? 1 : (serviceType === "buy" ? 4 : (serviceType === "scrap" ? (formData.buyNew === "yes" ? 6 - heroOffset : 5 - heroOffset) : 4)))

    if (mode === "scrap-valuation") {
        return (
            <>
                <div id="wizard-recaptcha-container"></div>
                <div className="w-full max-w-5xl mx-auto px-0 sm:px-4 py-3 sm:py-6 lg:py-8">
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white border-x-0 sm:border-x border-y border-slate-100 sm:rounded-[1.25rem] lg:rounded-[1.5rem] p-3 sm:p-5 lg:p-6 shadow-none sm:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden"
                    >
                        {/* Accent top line */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-[#E31E24] to-amber-500" />

                        <div className="relative z-10">
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 pb-4 border-b border-slate-100">
                                <div className="flex items-start sm:items-center gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                                        <Recycle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-0.5 flex items-center gap-1.5">
                                            EVALUATION FINALIZED
                                        </p>
                                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">Your Vehicle's Scrap Worth</h2>
                                    </div>
                                </div>
                                <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-slate-950 rounded-full shadow-md border border-slate-800 flex items-center self-start sm:self-auto">
                                    <p className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest">QUOTE ID: {quoteId || "SC-XXXXXX"}</p>
                                </div>
                            </div>

                            {/* Main Grid — single col on mobile, 12-col on lg */}
                            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
                                {/* Left Column: Potential Benefit & Cards (7 cols) */}
                                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                                    {/* Total Potential Benefit Box */}
                                    <div className="bg-gradient-to-br from-[#122333] to-[#0c1622] rounded-[1rem] p-3 sm:p-4 text-white relative overflow-hidden shadow-lg border border-slate-800">
                                        <p className="text-[8px] sm:text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em] mb-1 flex items-center gap-1.5">
                                            <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" /> TOTAL POTENTIAL BENEFIT
                                        </p>
                                        <div className="relative z-10">
                                            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-none tracking-tight mb-2.5">
                                                Up to ₹{formatCurrency(grandTotalBenefit)}*
                                            </h3>

                                            {/* Breakdown Box */}
                                            <div className={`grid ${formData.buyNew === "no" ? "grid-cols-1" : "grid-cols-2"} gap-2 sm:gap-3 mb-2 sm:mb-3`}>
                                                <div className="border border-white/10 bg-white/[0.02] rounded-xl p-2 sm:p-3">
                                                    <p className="text-[7.5px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-wider">SCRAP VALUE</p>
                                                    <p className="text-[11px] sm:text-xs font-black text-white mt-0.5">₹{formatCurrency(minScrapValue)} - ₹{formatCurrency(maxScrapValue)}</p>
                                                </div>
                                                {formData.buyNew !== "no" && (
                                                    <div className="border border-emerald-500/10 bg-emerald-500/[0.02] rounded-xl p-2 sm:p-3">
                                                        <p className="text-[7.5px] sm:text-[8px] font-bold text-emerald-400 uppercase tracking-wider">CD CERTIFICATE</p>
                                                        <p className="text-[11px] sm:text-xs font-black text-emerald-400 mt-0.5">
                                                            {formData.buyNew === "yes" && cdDiscount === null ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 inline" />
                                                            ) : `+ ₹${formatCurrency(potentialCDDiscount)}`}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <span className="inline-block px-2 py-0.5 bg-black/40 border border-white/10 text-slate-200 text-[7px] sm:text-[7.5px] font-bold rounded-full tracking-wider uppercase mb-1">
                                                ⚡ MARKET RATE: HIGH DEMAND
                                            </span>

                                            <p className="text-slate-400 text-[7.5px] sm:text-[8px] leading-normal italic mt-0.5">
                                                {formData.buyNew === "no"
                                                    ? `*Calculated using industrial scrap indices for ${weightNum} and all partner benefits.`
                                                    : `*Calculated using industrial scrap indices for ${weightNum}, maximum CD Certificate redemption value, and all partner benefits.`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* eKYC / Precise Valuation Action Button — desktop only (hidden on mobile, shown after bill) */}
                                    <div className="hidden lg:block pt-1 relative z-10">
                                        {/* Pulsing Light Glow Backdrop (Behind Button) */}
                                        <div className="absolute inset-x-0 bottom-0 top-1 bg-[#E31E24]/20 blur-md rounded-xl animate-[pulse_2.5s_infinite] -z-10 pointer-events-none" />
                                        <a
                                            href="/ekyc"
                                            onClick={() => {
                                                localStorage.setItem("kycFormData", JSON.stringify(formData));
                                                localStorage.setItem("kycSource", "scrap");
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#E31E24] via-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black rounded-xl border border-red-600/30 hover:border-white/60 transition-all duration-200 ease-out uppercase tracking-widest text-sm sm:text-base relative overflow-hidden group hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.95] active:brightness-95 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.45),_inset_0_-4px_0_rgba(0,0,0,0.2),_0_8px_16px_rgba(227,30,36,0.3)] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_inset_0_-2px_0_rgba(0,0,0,0.2),_0_4px_8px_rgba(227,30,36,0.2)]"
                                        >
                                            {/* Upward Floating Bubbles Animation */}
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                {[...Array(6)].map((_, i) => {
                                                    const sizes = [12, 16, 20, 14, 18, 22];
                                                    const xPositions = ["12%", "28%", "45%", "62%", "78%", "90%"];
                                                    const delays = [0, 0.7, 1.5, 2.2, 3.0, 3.7];
                                                    const durations = [3.2, 4.0, 3.5, 4.5, 3.8, 4.2];
                                                    return (
                                                        <motion.span
                                                            key={i}
                                                            className="absolute rounded-full bg-white/35"
                                                            style={{
                                                                width: sizes[i % sizes.length],
                                                                height: sizes[i % sizes.length],
                                                                left: xPositions[i % xPositions.length],
                                                                bottom: "-25px",
                                                            }}
                                                            animate={{
                                                                y: [0, -95],
                                                                opacity: [0, 0.65, 0.65, 0],
                                                                scale: [0.8, 1.2, 0.8],
                                                            }}
                                                            transition={{
                                                                duration: durations[i % durations.length],
                                                                repeat: Infinity,
                                                                delay: delays[i % delays.length],
                                                                ease: "linear",
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <span className="relative z-10">
                                                GET MORE PRECISE VALUATION
                                            </span>
                                        </a>
                                    </div>

                                    {/* 2x2 Grid of Benefit Cards */}
                                    <div className={`grid ${formData.buyNew === "no" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"} gap-2 sm:gap-3`}>
                                        {/* Card 1: CD Certificate */}
                                        {formData.buyNew !== "no" && (
                                            <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-2.5 sm:p-3 relative shadow-sm hover:shadow-md transition-all">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-3.5 right-3.5" />
                                                <p className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-wider">CD CERTIFICATE</p>
                                                <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">
                                                    {formData.buyNew === "yes" && cdDiscount === null ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin inline text-emerald-600" />
                                                    ) : `+ ₹${formatCurrency(potentialCDDiscount)}`}
                                                </p>
                                                <p className="text-[8px] sm:text-[9px] text-emerald-800/80 font-semibold mt-0.5 leading-tight">Registration & tax waiver</p>
                                            </div>
                                        )}

                                        {/* Card 2: Dealer OEM Discount */}
                                        <div className="hidden sm:block bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 sm:p-3 relative hover:shadow-sm transition-all">
                                            <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-wider">DEALER OEM DISCOUNT</p>
                                            <p className="text-base sm:text-lg font-black text-slate-800 mt-0.5">Up to ₹{formatCurrency(dealerOemDiscount)}</p>
                                            <p className="text-[8px] sm:text-[9px] text-slate-500 font-semibold mt-0.5 leading-tight">Scrappage exchange benefits</p>
                                        </div>

                                        {/* Card 3: Green Finance */}
                                        <div className="hidden sm:block bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 sm:p-3 relative hover:shadow-sm transition-all">
                                            <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-wider">GREEN FINANCE</p>
                                            <p className="text-base sm:text-lg font-black text-slate-800 mt-0.5">Up to ₹{formatCurrency(greenFinanceSavings)}</p>
                                            <p className="text-[8px] sm:text-[9px] text-slate-500 font-semibold mt-0.5 leading-tight">Lower interest green loans</p>
                                        </div>

                                        {/* Card 4: Green Insurance */}
                                        <div className="hidden sm:block bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5 sm:p-3 relative hover:shadow-sm transition-all">
                                            <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-wider">GREEN INSURANCE</p>
                                            <p className="text-base sm:text-lg font-black text-slate-800 mt-0.5">Up to ₹{formatCurrency(greenInsuranceSavings)}</p>
                                            <p className="text-[8px] sm:text-[9px] text-slate-500 font-semibold mt-0.5 leading-tight">Eco insurance rebates</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Invoice Benefit Summary Receipt (5 cols) */}
                                <div className="lg:col-span-5">
                                    <div className="bg-[#f8fafc] border border-slate-200/80 rounded-[1.25rem] sm:rounded-[1.5rem] p-4 sm:p-5 md:p-6 flex flex-col justify-between shadow-inner h-full">
                                        <div className="space-y-3 sm:space-y-4">
                                            {/* Invoice Header */}
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">EST. INVOICE</p>
                                                    <h4 className="text-slate-900 font-black text-sm sm:text-md leading-tight uppercase tracking-tight">BENEFIT SUMMARY RECEIPT</h4>
                                                </div>
                                                <span className="bg-red-50 text-red-500 border border-red-150 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">EST-BILL</span>
                                            </div>

                                            {/* Dotted Divider */}
                                            <div className="border-t border-dashed border-slate-300 my-3 sm:my-4" />

                                            {/* Row: SCRAP VEHICLE */}
                                            <div className="flex justify-between items-start gap-4 text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">SCRAP VEHICLE</span>
                                                <span className="text-slate-900 font-black text-right uppercase max-w-[200px] leading-tight text-[11px] sm:text-xs">
                                                    {formData.brand || "HYUNDAI MOTOR INDIA LTD"} {formData.model || "SANTRO XG"} ({formData.year || "2005"})
                                                </span>
                                            </div>

                                            {/* Row: UNLADEN WEIGHT */}
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">UNLADEN WEIGHT</span>
                                                <span className="text-slate-900 font-black text-[11px] sm:text-xs">{weightNum} kg</span>
                                            </div>

                                            {/* Row: BASE RATE / KG */}
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">BASE RATE / KG</span>
                                                <span className="text-slate-900 font-black text-[11px] sm:text-xs">₹{ratePerKg} / kg</span>
                                            </div>

                                            {/* Solid Divider */}
                                            <div className="border-t border-slate-200 my-3 sm:my-4" />

                                            {/* Itemized Rows */}
                                            <div className="space-y-2.5 sm:space-y-3.5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-600 font-medium text-[11px] sm:text-xs">Scrap Value Estimate (Average)</span>
                                                    <span className="text-slate-900 font-extrabold text-[11px] sm:text-xs">₹{formatCurrency(averageScrapValue)}</span>
                                                </div>

                                                {formData.buyNew !== "no" && (
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-emerald-600 font-bold text-[11px] sm:text-xs">CD Certificate Advantage</span>
                                                        <span className="text-emerald-600 font-extrabold text-[11px] sm:text-xs">+ ₹{formatCurrency(potentialCDDiscount)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-600 font-medium text-[11px] sm:text-xs">Dealer OEM Discount</span>
                                                    <span className="text-slate-900 font-extrabold text-[11px] sm:text-xs">+ ₹{formatCurrency(dealerOemDiscount)}</span>
                                                </div>

                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-600 font-medium text-[11px] sm:text-xs">Green Finance Savings</span>
                                                    <span className="text-slate-900 font-extrabold text-[11px] sm:text-xs">+ ₹{formatCurrency(greenFinanceSavings)}</span>
                                                </div>

                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-600 font-medium text-[11px] sm:text-xs">Green Insurance Savings</span>
                                                    <span className="text-slate-900 font-extrabold text-[11px] sm:text-xs">+ ₹{formatCurrency(greenInsuranceSavings)}</span>
                                                </div>
                                            </div>

                                            {/* Dashed Divider */}
                                            <div className="border-t border-dashed border-slate-300 my-3 sm:my-4" />

                                            {/* Grand Total Benefit Card */}
                                            <div className="bg-[#0f172a] rounded-[1.25rem] p-3.5 sm:p-4 text-white flex items-center justify-between shadow-md border border-slate-800">
                                                <div>
                                                    <p className="text-[8px] sm:text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-0.5">GRAND TOTAL BENEFIT</p>
                                                    <p className="text-[9px] sm:text-[10px] text-slate-300 font-medium">
                                                        {formData.buyNew === "no" ? "Scrap + Partner Savings" : "Scrap + CD + Partner Savings"}
                                                    </p>
                                                </div>
                                                <span className="text-xl sm:text-2xl font-black text-white">₹{formatCurrency(grandTotalBenefit)}</span>
                                            </div>
                                        </div>

                                        {/* Footer Disclaimer */}
                                        <p className="text-slate-400 text-[9px] sm:text-[10px] italic mt-4 sm:mt-6 text-center leading-normal">
                                            {formData.buyNew === "no"
                                                ? "*Our team will assist you in getting the best scrap value and partner savings."
                                                : "*Our team will assist you for getting best value of your CD Certificate."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* eKYC button — mobile only, shown after bill */}
                            <div className="lg:hidden pt-2 relative z-10">
                                <div className="absolute inset-x-0 bottom-0 top-1 bg-[#E31E24]/20 blur-md rounded-xl animate-[pulse_2.5s_infinite] -z-10 pointer-events-none" />
                                <a
                                    href="/ekyc"
                                    onClick={() => {
                                        localStorage.setItem("kycFormData", JSON.stringify(formData));
                                        localStorage.setItem("kycSource", "scrap");
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#E31E24] via-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black rounded-xl border border-red-600/30 hover:border-white/60 transition-all duration-200 ease-out uppercase tracking-widest text-sm relative overflow-hidden group active:scale-[0.95] active:brightness-95 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.45),_inset_0_-4px_0_rgba(0,0,0,0.2),_0_8px_16px_rgba(227,30,36,0.3)]"
                                >
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                        {[...Array(6)].map((_, i) => {
                                            const sizes = [12, 16, 20, 14, 18, 22];
                                            const xPositions = ["12%", "28%", "45%", "62%", "78%", "90%"];
                                            const delays = [0, 0.7, 1.5, 2.2, 3.0, 3.7];
                                            const durations = [3.2, 4.0, 3.5, 4.5, 3.8, 4.2];
                                            return (
                                                <motion.span
                                                    key={i}
                                                    className="absolute rounded-full bg-white/35"
                                                    style={{
                                                        width: sizes[i % sizes.length],
                                                        height: sizes[i % sizes.length],
                                                        left: xPositions[i % xPositions.length],
                                                        bottom: "-25px",
                                                    }}
                                                    animate={{
                                                        y: [0, -95],
                                                        opacity: [0, 0.65, 0.65, 0],
                                                        scale: [0.8, 1.2, 0.8],
                                                    }}
                                                    transition={{
                                                        duration: durations[i % durations.length],
                                                        repeat: Infinity,
                                                        delay: delays[i % delays.length],
                                                        ease: "linear",
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className="relative z-10">GET MORE PRECISE VALUATION</span>
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
            <div className={`w-full max-w-2xl mx-auto px-0 sm:px-4 transition-all duration-300`}>
                <div className="bg-white border-x-0 sm:border-x border-y border-slate-200 sm:rounded-[1rem] overflow-hidden shadow-none sm:shadow-2xl">
                    <div className="bg-slate-50 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between">
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

                    <div className="relative p-3.5 sm:p-5 lg:p-6 min-h-[360px] sm:min-h-[300px] flex flex-col justify-center">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div key={serviceType ? `${serviceType}-${step}` : "selection"} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="w-full">

                                {/* ── INITIAL SITUATION SELECTION ── */}
                                {!serviceType && (
                                    <div className="space-y-5 text-center">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-slate-800">What is your situation?</h3>
                                            <p className="text-slate-400 text-[11px]">Choose what you&apos;re looking for today.</p>
                                        </div>

                                        {fromHero && formData.regNo && (
                                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl max-w-xs mx-auto">
                                                <CheckCircle className="w-4 h-4 text-[#E31E24] shrink-0" />
                                                <span className="text-[11px] font-bold text-[#E31E24]">Vehicle <span className="tracking-widest">{formData.regNo}</span> loaded</span>
                                            </div>
                                        )}

                                        {/* Identical side-by-side cards */}
                                        <div className="flex flex-col sm:flex-row gap-3 w-[90%] max-w-[320px] sm:w-full sm:max-w-md mx-auto px-1">
                                            {[
                                                ...(!fromHero ? [{
                                                    key: "buy",
                                                    Icon: Car,
                                                    title: "Buy a new Vehicle",
                                                    subtitle: "Exchange offers & OEM benefits on your next car",
                                                    onClick: () => { setDirection(1); setServiceType("buy"); setStep(0) }
                                                }] : []),
                                                {
                                                    key: "scrap",
                                                    Icon: Recycle,
                                                    title: "Scrap your Vehicle",
                                                    subtitle: "Best scrap value with eco-friendly pickup",
                                                    onClick: () => { setDirection(1); setServiceType("scrap"); setStep(fromHero ? 1 : 0) }
                                                }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    onClick={opt.onClick}
                                                    className="flex-1 flex flex-col items-start gap-3 p-4 rounded-2xl text-left group transition-all duration-200 bg-white border-2 border-red-100 hover:border-[#E31E24] hover:shadow-md hover:-translate-y-0.5 focus:outline-none"
                                                >
                                                    {/* Icon — same style on both */}
                                                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                                        <opt.Icon className="w-5 h-5 text-[#E31E24]" />
                                                    </div>

                                                    {/* Text */}
                                                    <div className="flex-1 text-left">
                                                        <p className="font-bold text-slate-800 text-sm leading-snug">{opt.title}</p>
                                                        <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{opt.subtitle}</p>
                                                    </div>

                                                    {/* CTA — same on both */}
                                                    <div className="w-full py-2 rounded-xl flex items-center justify-center gap-1.5 bg-[#E31E24] text-white text-[11px] font-bold group-hover:bg-red-700 transition-colors">
                                                        Get Started <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}



                                {/* ── BUY FLOW ── */}
                                {serviceType === "buy" && (
                                    <>
                                        {step === 0 && (
                                            <div className="space-y-5 text-center">
                                                <h3 className="text-xl font-bold text-slate-900">Which vehicle do you want to buy?</h3>
                                                <div className="space-y-3 max-w-md mx-auto">
                                                    {!formData.desiredCompany ? (
                                                        <div className="space-y-1.5 text-left">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desired Brand</label>
                                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                {BRANDS.map((b) => (
                                                                    <button
                                                                        key={b}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedBrand(b);
                                                                            setSelectedModel("");
                                                                            setCustomModel("");
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                desiredCompany: b,
                                                                                desiredModel: ""
                                                                            }));
                                                                        }}
                                                                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${formData.desiredCompany === b
                                                                                ? 'border-[#E31E24] bg-red-50 shadow-sm'
                                                                                : b === "Other"
                                                                                    ? 'border-dashed border-slate-200 bg-white hover:border-[#E31E24] hover:bg-red-50/30'
                                                                                    : 'border-slate-100 bg-white hover:border-red-200 hover:bg-red-50/50'
                                                                            }`}
                                                                    >
                                                                        {BRAND_LOGOS[b] ? (
                                                                            <img src={BRAND_LOGOS[b]} alt={b} className="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-1 sm:mb-1.5 drop-shadow-sm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                        ) : (
                                                                            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-100 rounded-full mb-1 sm:mb-1.5"><Car className="w-4 h-4 text-slate-400" /></div>
                                                                        )}
                                                                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5 flex items-center justify-center gap-1">
                                                                            {b}
                                                                            {b === "Other" && (
                                                                                <span className={`w-1 h-1 rounded-full transition-all ${formData.desiredCompany === b ? 'bg-[#E31E24] scale-125' : 'bg-red-400'}`} />
                                                                            )}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Selected Brand Header */}
                                                            <div className="flex items-center justify-between bg-slate-50/80 border border-slate-200/60 rounded-xl px-4 py-2.5 shadow-sm text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Brand:</span>
                                                                    <span className="text-xs font-black text-slate-800">
                                                                        {selectedBrand === "Other" && customBrand ? customBrand : (selectedBrand === "Other" ? "Other" : selectedBrand)}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedBrand("");
                                                                        setSelectedModel("");
                                                                        setCustomBrand("");
                                                                        setCustomModel("");
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            desiredCompany: "",
                                                                            desiredModel: ""
                                                                        }));
                                                                    }}
                                                                    className="text-[9px] font-black text-[#E31E24] hover:underline uppercase tracking-widest"
                                                                >
                                                                    Change
                                                                </button>
                                                            </div>

                                                            {/* Custom Brand Input (if "Other" brand is selected) */}
                                                            {selectedBrand === "Other" && (
                                                                <div className="space-y-1 text-left">
                                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Brand Name</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. Ford, Chevrolet, etc."
                                                                        value={customBrand}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            setCustomBrand(val);
                                                                            setFormData(prev => ({ ...prev, desiredCompany: val || "Other" }));
                                                                        }}
                                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#E31E24]"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Model Selection (based on selected brand) */}
                                                            <div className="space-y-1.5 text-left">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desired Model</label>
                                                                {selectedBrand !== "Other" && BRAND_MODELS[selectedBrand] ? (
                                                                    <>
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            {BRAND_MODELS[selectedBrand].map((m) => (
                                                                                <button
                                                                                    key={m}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setSelectedModel(m);
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            desiredModel: m === "Other" ? customModel : m
                                                                                        }));
                                                                                    }}
                                                                                    className={`py-2 px-1 rounded-xl border text-[10px] sm:text-xs font-semibold text-center transition-all ${selectedModel === m
                                                                                            ? 'border-[#E31E24] bg-red-50 text-[#E31E24] font-bold shadow-sm'
                                                                                            : m === "Other"
                                                                                                ? 'border-dashed border-slate-200 bg-white hover:border-[#E31E24] hover:bg-red-50/30 text-slate-500 hover:text-[#E31E24]'
                                                                                                : 'border-slate-100 bg-white hover:border-red-100 hover:bg-red-50/20 text-slate-600'
                                                                                        }`}
                                                                                >
                                                                                    {m === "Other" ? (
                                                                                        <span className="flex items-center justify-center gap-1.5">
                                                                                            {m}
                                                                                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${selectedModel === m ? 'bg-[#E31E24] scale-125' : 'bg-red-400'}`} />
                                                                                        </span>
                                                                                    ) : (
                                                                                        m
                                                                                    )}
                                                                                </button>
                                                                            ))}
                                                                        </div>

                                                                        {/* Custom Model Input (if "Other" model is selected from grid) */}
                                                                        {selectedModel === "Other" && (
                                                                            <div className="mt-2.5 space-y-1">
                                                                                <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Enter Model Name</label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="e.g. Nexon, Creta, etc."
                                                                                    value={customModel}
                                                                                    onChange={(e) => {
                                                                                        const val = e.target.value;
                                                                                        setCustomModel(val);
                                                                                        setFormData(prev => ({ ...prev, desiredModel: val }));
                                                                                    }}
                                                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    /* Fallback text input for custom brands */
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. Swift"
                                                                        value={formData.desiredModel}
                                                                        onChange={(e) => setFormData({ ...formData, desiredModel: e.target.value })}
                                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]"
                                                                    />
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <button disabled={!formData.desiredCompany || !formData.desiredModel} onClick={nextStep} className="w-full max-w-md mx-auto py-3 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[11px]">Continue</button>
                                            </div>
                                        )}
                                        {step === 1 && (
                                            <div className="space-y-5 text-center">
                                                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><User className="w-7 h-7 text-[#E31E24]" /></div>
                                                <h3 className="text-xl font-bold text-slate-900">Tell us your name</h3>
                                                <input type="text" placeholder="Your Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full max-w-md mx-auto px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" autoFocus />
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
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
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
                                                                onChange={(e) => setFormData({ ...formData, otp: e.target.value.slice(0, 6) })}
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
                                                                onClick={() => { setOtpSent(false); setFormData({ ...formData, otp: "" }); setIsSandboxMode(false); }}
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
                                            isFetching ? (
                                                <div className="flex flex-col items-center justify-center py-6 space-y-5 animate-fadeIn">
                                                    {/* Running Car Track Container */}
                                                    <div className="relative w-64 h-28 flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-100">
                                                        {/* Wind/Speed lines moving fast */}
                                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                            <motion.div
                                                                className="absolute h-[1.5px] bg-[#E31E24]/20 w-8 rounded-full"
                                                                style={{ top: "20%", right: -40 }}
                                                                animate={{ x: [0, -320] }}
                                                                transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                                                            />
                                                            <motion.div
                                                                className="absolute h-[1.5px] bg-slate-300/60 w-12 rounded-full"
                                                                style={{ top: "45%", right: -40 }}
                                                                animate={{ x: [0, -320] }}
                                                                transition={{ repeat: Infinity, duration: 0.7, ease: "linear", delay: 0.15 }}
                                                            />
                                                            <motion.div
                                                                className="absolute h-[1.5px] bg-slate-400/20 w-10 rounded-full"
                                                                style={{ top: "70%", right: -40 }}
                                                                animate={{ x: [0, -320] }}
                                                                transition={{ repeat: Infinity, duration: 0.6, ease: "linear", delay: 0.3 }}
                                                            />
                                                        </div>

                                                        {/* Bouncing Driving Sedan */}
                                                        <motion.div
                                                            className="relative z-10"
                                                            animate={{
                                                                y: [0, -3, 0],
                                                                rotate: [0, -0.5, 0.5, 0]
                                                            }}
                                                            transition={{
                                                                repeat: Infinity,
                                                                duration: 0.45,
                                                                ease: "easeInOut"
                                                            }}
                                                        >
                                                            <Car className="w-14 h-14 text-[#E31E24] filter drop-shadow-[0_4px_6px_rgba(227,30,36,0.3)]" />
                                                        </motion.div>

                                                        {/* Road Dash lines underneath */}
                                                        <div className="w-44 h-[3px] bg-slate-200/80 rounded-full relative overflow-hidden flex items-center mt-2.5">
                                                            <motion.div
                                                                className="absolute h-[2px] bg-slate-400/80 w-10 rounded-full"
                                                                initial={{ x: 180 }}
                                                                animate={{ x: -50 }}
                                                                transition={{ repeat: Infinity, duration: 0.45, ease: "linear" }}
                                                            />
                                                            <motion.div
                                                                className="absolute h-[2px] bg-slate-400/80 w-10 rounded-full"
                                                                initial={{ x: 90 }}
                                                                animate={{ x: -140 }}
                                                                transition={{ repeat: Infinity, duration: 0.45, ease: "linear", delay: 0.22 }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Status text with animated typing dots */}
                                                    <div className="space-y-1.5 text-center">
                                                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                                            Fetching Specifications
                                                            <span className="flex gap-0.5 items-center">
                                                                <span className="w-1.5 h-1.5 bg-[#E31E24] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                <span className="w-1.5 h-1.5 bg-[#E31E24] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                <span className="w-1.5 h-1.5 bg-[#E31E24] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                            </span>
                                                        </p>
                                                        <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Connecting to RTO details for {formData.regNo}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 sm:space-y-6 text-center py-4 sm:py-6 animate-fadeIn relative overflow-hidden rounded-2xl">
                                                    {/* Animated Background Gradients */}
                                                    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                                                        <motion.div
                                                            className="absolute -top-12 -left-12 w-44 h-44 bg-red-500/5 rounded-full blur-2xl"
                                                            animate={{
                                                                x: [0, 20, 0],
                                                                y: [0, 20, 0],
                                                            }}
                                                            transition={{
                                                                duration: 6,
                                                                repeat: Infinity,
                                                                ease: "easeInOut"
                                                            }}
                                                        />
                                                        <motion.div
                                                            className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-500/5 rounded-full blur-2xl"
                                                            animate={{
                                                                x: [0, -20, 0],
                                                                y: [0, -20, 0],
                                                            }}
                                                            transition={{
                                                                duration: 6,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                                delay: 3
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="space-y-1 relative z-10">
                                                        <span className="text-[9px] sm:text-[10px] font-black text-[#E31E24] uppercase tracking-[0.2em] bg-red-50/80 px-3 py-1 rounded-full">Registration</span>
                                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5">Vehicle Number</h3>
                                                        <p className="text-slate-400 text-[10.5px] sm:text-[11.5px] font-medium px-2">Enter your registration number below to retrieve vehicle details</p>
                                                    </div>

                                                    {/* Premium Input Container */}
                                                    <div className="relative max-w-md mx-auto px-1 relative z-10">
                                                        <input
                                                            type="text"
                                                            placeholder="E.g. DL-01-AB-1234"
                                                            value={formData.regNo}
                                                            onChange={(e) => setFormData({ ...formData, regNo: e.target.value.toUpperCase() })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    if (formData.regNo && !isFetching) {
                                                                        handleRegSubmit();
                                                                    }
                                                                }
                                                            }}
                                                            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50/60 hover:bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-[#E31E24]/10 rounded-xl text-center text-sm xs:text-base sm:text-lg md:text-xl font-black tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:font-semibold placeholder:tracking-normal focus:outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                        />
                                                    </div>

                                                    <button
                                                        disabled={!formData.regNo || isFetching}
                                                        onClick={handleRegSubmit}
                                                        className="relative overflow-hidden w-full max-w-md mx-auto py-2.5 sm:py-3 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold rounded-xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-xs border border-red-500/10 relative z-10"
                                                    >
                                                        {/* Sweeping shine effect */}
                                                        <span className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                                                        <span className="relative z-10 font-bold uppercase tracking-wider text-xs">
                                                            Fetch Details
                                                        </span>
                                                    </button>
                                                </div>
                                            )
                                        )}
                                        {step === 1 && (
                                            <div className="space-y-4 relative overflow-hidden rounded-2xl py-2">
                                                {/* Animated Background Gradients */}
                                                <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                                                    <motion.div
                                                        className="absolute -top-12 -left-12 w-44 h-44 bg-red-500/5 rounded-full blur-2xl"
                                                        animate={{
                                                            x: [0, 20, 0],
                                                            y: [0, 20, 0],
                                                        }}
                                                        transition={{
                                                            duration: 6,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                    />
                                                    <motion.div
                                                        className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-500/5 rounded-full blur-2xl"
                                                        animate={{
                                                            x: [0, -20, 0],
                                                            y: [0, -20, 0],
                                                        }}
                                                        transition={{
                                                            duration: 6,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: 3
                                                        }}
                                                    />
                                                </div>

                                                <div className="text-center pt-2 relative z-10">
                                                    <h3 className="text-lg font-bold text-slate-900">Verify Vehicle Details</h3>
                                                    <p className="text-slate-500 text-[11px] font-medium">Auto-filled based on your registration</p>
                                                </div>

                                                <motion.div
                                                    variants={{
                                                        hidden: { opacity: 0 },
                                                        show: {
                                                            opacity: 1,
                                                            transition: { staggerChildren: 0.06 }
                                                        }
                                                    }}
                                                    initial="hidden"
                                                    animate="show"
                                                    className="grid grid-cols-2 gap-2.5 max-w-md mx-auto relative z-10"
                                                >
                                                    <motion.div
                                                        variants={{
                                                            hidden: { opacity: 0, y: 8 },
                                                            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
                                                        }}
                                                        className="space-y-0.5"
                                                    >
                                                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Company / Brand</label>
                                                        <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" />
                                                    </motion.div>
                                                    <motion.div
                                                        variants={{
                                                            hidden: { opacity: 0, y: 8 },
                                                            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
                                                        }}
                                                        className="space-y-0.5"
                                                    >
                                                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Model Name</label>
                                                        <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. Santro" />
                                                    </motion.div>
                                                    <motion.div
                                                        variants={{
                                                            hidden: { opacity: 0, y: 8 },
                                                            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
                                                        }}
                                                        className="space-y-0.5"
                                                    >
                                                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Owner Name</label>
                                                        <input type="text" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. Satish Kumar" />
                                                    </motion.div>
                                                    <motion.div
                                                        variants={{
                                                            hidden: { opacity: 0, y: 8 },
                                                            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
                                                        }}
                                                        className="space-y-0.5"
                                                    >
                                                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Fuel Type</label>
                                                        <input type="text" value={formData.fuel} onChange={(e) => setFormData({ ...formData, fuel: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24]" placeholder="e.g. Petrol" />
                                                    </motion.div>
                                                    <motion.div
                                                        variants={{
                                                            hidden: { opacity: 0, y: 8 },
                                                            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
                                                        }}
                                                        className="space-y-0.5 col-span-2 text-left"
                                                    >
                                                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Registered Address</label>
                                                        <textarea rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none focus:border-[#E31E24] resize-none" placeholder="Registered Address" />
                                                    </motion.div>
                                                </motion.div>

                                                <motion.button
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 22 }}
                                                    onClick={nextStep}
                                                    className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center relative z-10"
                                                >
                                                    Confirm & Continue
                                                </motion.button>
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="space-y-5 text-center">
                                                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Car className="w-7 h-7 text-[#E31E24]" /></div>
                                                <h3 className="text-xl font-bold text-slate-900">Buy a new vehicle?</h3>
                                                <p className="text-slate-500 text-[11px] font-medium">Would you like to purchase a new vehicle while scrapping this one to claim CD certificate benefits?</p>
                                                <div className="flex gap-3 max-w-md mx-auto justify-center">
                                                    <button onClick={() => { setFormData({ ...formData, buyNew: "yes" }); nextStep("yes") }} className="w-1/2 py-2.5 border border-slate-100 rounded-xl font-bold text-sm text-slate-700 hover:border-[#E31E24] hover:bg-red-50 transition-all shadow-sm">Yes</button>
                                                    <button onClick={() => { setFormData({ ...formData, buyNew: "no" }); nextStep("no") }} className="w-1/2 py-2.5 border border-slate-100 rounded-xl font-bold text-sm text-slate-700 hover:border-[#E31E24] hover:bg-red-50 transition-all shadow-sm">No</button>
                                                </div>
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-5 text-center relative overflow-hidden rounded-2xl py-3">
                                                {/* Animated Background Gradients */}
                                                <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                                                    <motion.div
                                                        className="absolute -top-12 -left-12 w-44 h-44 bg-red-500/5 rounded-full blur-2xl"
                                                        animate={{
                                                            x: [0, 20, 0],
                                                            y: [0, 20, 0],
                                                        }}
                                                        transition={{
                                                            duration: 6,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                    />
                                                    <motion.div
                                                        className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-500/5 rounded-full blur-2xl"
                                                        animate={{
                                                            x: [0, -20, 0],
                                                            y: [0, -20, 0],
                                                        }}
                                                        transition={{
                                                            duration: 6,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: 3
                                                        }}
                                                    />
                                                </div>

                                                <div className="space-y-1 relative z-10">
                                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Vehicle Choice</h3>
                                                    <p className="text-slate-500 text-[11px] font-medium mb-3">Details of the new vehicle you wish to buy.</p>
                                                </div>

                                                <div className="space-y-4 max-w-md mx-auto relative z-10">
                                                    {!selectedBrand ? (
                                                        <div className="space-y-1.5 text-left">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                                                            <motion.div
                                                                variants={{
                                                                    hidden: { opacity: 0 },
                                                                    show: {
                                                                        opacity: 1,
                                                                        transition: { staggerChildren: 0.03 }
                                                                    }
                                                                }}
                                                                initial="hidden"
                                                                animate="show"
                                                                className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                                                            >
                                                                {BRANDS.map((b) => (
                                                                    <motion.button
                                                                        variants={{
                                                                            hidden: { opacity: 0, scale: 0.95 },
                                                                            show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
                                                                        }}
                                                                        key={b}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedBrand(b);
                                                                            setSelectedModel("");
                                                                            setCustomModel("");
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                desiredCompany: b === "Other" ? customBrand : b,
                                                                                desiredModel: ""
                                                                            }));
                                                                        }}
                                                                        className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl border text-[10px] sm:text-xs font-semibold text-center transition-all ${selectedBrand === b
                                                                                ? 'border-[#E31E24] bg-red-50 text-[#E31E24] font-bold shadow-sm'
                                                                                : b === "Other"
                                                                                    ? 'border-dashed border-slate-200 bg-white hover:border-[#E31E24] hover:bg-red-50/30 text-slate-500 hover:text-[#E31E24]'
                                                                                    : 'border-slate-100 bg-white hover:border-red-100 hover:bg-red-50/20 text-slate-600'
                                                                            }`}
                                                                    >
                                                                        {b === "Other" ? (
                                                                            <span className="flex items-center justify-center gap-1.5">
                                                                                {b}
                                                                                <span className={`w-1.5 h-1.5 rounded-full transition-all ${selectedBrand === b ? 'bg-[#E31E24] scale-125' : 'bg-red-400'}`} />
                                                                            </span>
                                                                        ) : (
                                                                            b
                                                                        )}
                                                                    </motion.button>
                                                                ))}
                                                            </motion.div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Selected Brand Header */}
                                                            <div className="flex items-center justify-between bg-slate-50/80 border border-slate-200/60 rounded-xl px-4 py-2.5 shadow-sm text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Brand:</span>
                                                                    <span className="text-xs font-black text-slate-800">{selectedBrand === "Other" && customBrand ? customBrand : selectedBrand}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedBrand("");
                                                                        setSelectedModel("");
                                                                        setCustomBrand("");
                                                                        setCustomModel("");
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            desiredCompany: "",
                                                                            desiredModel: ""
                                                                        }));
                                                                    }}
                                                                    className="text-[9px] font-black text-[#E31E24] hover:underline uppercase tracking-widest"
                                                                >
                                                                    Change
                                                                </button>
                                                            </div>

                                                            {/* Custom Brand Input (if "Other" brand is selected) */}
                                                            {selectedBrand === "Other" && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="mt-1.5 space-y-1 text-left"
                                                                >
                                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Enter Brand Name</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. Ford, Chevrolet, etc."
                                                                        value={customBrand}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            setCustomBrand(val);
                                                                            setFormData(prev => ({ ...prev, desiredCompany: val }));
                                                                        }}
                                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-150 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-[#E31E24]/10 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                                                    />
                                                                </motion.div>
                                                            )}

                                                            {/* Model Selection (based on selected brand) */}
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="space-y-1.5 text-left pt-1"
                                                            >
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</label>

                                                                {selectedBrand !== "Other" && BRAND_MODELS[selectedBrand] ? (
                                                                    <>
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            {BRAND_MODELS[selectedBrand].map((m) => (
                                                                                <button
                                                                                    key={m}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setSelectedModel(m);
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            desiredModel: m === "Other" ? customModel : m
                                                                                        }));
                                                                                    }}
                                                                                    className={`py-2 px-1 rounded-xl border text-[10px] sm:text-xs font-semibold text-center transition-all ${selectedModel === m
                                                                                            ? 'border-[#E31E24] bg-red-50 text-[#E31E24] font-bold shadow-sm'
                                                                                            : m === "Other"
                                                                                                ? 'border-dashed border-slate-200 bg-white hover:border-[#E31E24] hover:bg-red-50/30 text-slate-500 hover:text-[#E31E24]'
                                                                                                : 'border-slate-100 bg-white hover:border-red-100 hover:bg-red-50/20 text-slate-600'
                                                                                        }`}
                                                                                >
                                                                                    {m === "Other" ? (
                                                                                        <span className="flex items-center justify-center gap-1.5">
                                                                                            {m}
                                                                                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${selectedModel === m ? 'bg-[#E31E24] scale-125' : 'bg-red-400'}`} />
                                                                                        </span>
                                                                                    ) : (
                                                                                        m
                                                                                    )}
                                                                                </button>
                                                                            ))}
                                                                        </div>

                                                                        {/* Custom Model Input (if "Other" model is selected from grid) */}
                                                                        {selectedModel === "Other" && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, y: 5 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                className="mt-2.5 space-y-1"
                                                                            >
                                                                                <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Enter Model Name</label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="e.g. Nexon, Creta, etc."
                                                                                    value={customModel}
                                                                                    onChange={(e) => {
                                                                                        const val = e.target.value;
                                                                                        setCustomModel(val);
                                                                                        setFormData(prev => ({ ...prev, desiredModel: val }));
                                                                                    }}
                                                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-150 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-[#E31E24]/10 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                                                                />
                                                                            </motion.div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    /* Direct custom model input if brand is custom */
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. Mustang, Civic, etc."
                                                                        value={customModel}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            setCustomModel(val);
                                                                            setFormData(prev => ({ ...prev, desiredModel: val }));
                                                                        }}
                                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-[#E31E24] focus:ring-4 focus:ring-[#E31E24]/10 rounded-xl text-center text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                                                                    />
                                                                )}
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </div>

                                                <motion.button
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 22 }}
                                                    disabled={!formData.desiredCompany || !formData.desiredModel}
                                                    onClick={() => nextStep()}
                                                    className="w-full max-w-md mx-auto py-2.5 bg-[#E31E24] text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[10px] relative z-10"
                                                >
                                                    Continue
                                                </motion.button>
                                            </div>
                                        )}

                                        {step === 4 && (() => {
                                            return (
                                                <div className="space-y-3">
                                                    <div className="text-center space-y-1 mb-2">
                                                        <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                            Step {totalSteps} of {totalSteps} — scrap Service 100%
                                                        </span>
                                                        <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight mt-1">Your Scrap Valuation is Ready! 🎉</h3>
                                                        <div className="flex justify-center items-center py-2">
                                                            {/* Phone Verification Card */}
                                                            <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[1rem] p-5 sm:p-6 flex flex-col justify-center items-center shadow-sm relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

                                                                {/* Phone Verification / OTP */}
                                                                <div className="w-full flex flex-col items-center text-center space-y-3.5">
                                                                    <div>
                                                                        <h4 className="text-xs sm:text-sm font-black text-[#E31E24] uppercase tracking-wider mb-1">
                                                                            {otpSent ? "VERIFY IDENTITY" : (formData.buyNew === "no" ? "UNLOCK VALUATION & BENEFITS" : "UNLOCK CD BENEFITS")}
                                                                        </h4>
                                                                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
                                                                            {otpSent
                                                                                ? "Enter the OTP sent to your phone."
                                                                                : (formData.buyNew === "no"
                                                                                    ? "Enter your phone number to unlock your scrap valuation and partner benefits."
                                                                                    : "Enter your phone number to unlock your CD certificate and partner benefits.")}
                                                                        </p>
                                                                    </div>

                                                                    <div className="w-full space-y-2.5">
                                                                        <div className="relative">
                                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">+91</span>
                                                                            <input
                                                                                type="tel"
                                                                                disabled={otpSent}
                                                                                placeholder="10-digit number"
                                                                                value={formData.phone}
                                                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#E31E24]/60 focus:bg-white rounded-lg text-base font-bold text-slate-900 focus:outline-none transition-all disabled:opacity-50"
                                                                                maxLength={10}
                                                                            />
                                                                        </div>

                                                                        {otpSent && (
                                                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                                                                                <input
                                                                                    type="tel"
                                                                                    placeholder={isSandboxMode ? "Use: 000000" : "••••••"}
                                                                                    value={formData.otp}
                                                                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.slice(0, 6) })}
                                                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-[#E31E24]/30 rounded-lg text-xl text-center font-black tracking-[0.35em] text-slate-900 focus:outline-none focus:border-[#E31E24]"
                                                                                    maxLength={6}
                                                                                    autoFocus
                                                                                />
                                                                                {isSandboxMode && (
                                                                                    <p className="text-[8px] text-amber-600 font-bold">⚡ Sandbox mode — enter 000000</p>
                                                                                )}
                                                                                <button
                                                                                    onClick={() => { setOtpSent(false); setFormData({ ...formData, otp: "" }); setIsSandboxMode(false); }}
                                                                                    className="text-[9px] font-bold text-slate-400 hover:text-[#E31E24] uppercase tracking-widest transition-colors"
                                                                                    type="button"
                                                                                >
                                                                                    Change Number
                                                                                </button>
                                                                            </motion.div>
                                                                        )}

                                                                        <button
                                                                            disabled={(otpSent ? (formData.otp.length !== 6 && formData.otp.length !== 4) : formData.phone.length !== 10) || isSendingOtp || isVerifying}
                                                                            onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                                                                            className="w-full py-2.5 bg-[#E31E24] hover:bg-red-600 text-white font-black rounded-lg shadow-md shadow-red-500/25 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-1.5"
                                                                        >
                                                                            {isSendingOtp || isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : (otpSent ? "VERIFY & GET VALUATION" : "GET OTP")}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
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

                    <div className="bg-slate-50/50 px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-100 flex flex-wrap gap-2">
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

