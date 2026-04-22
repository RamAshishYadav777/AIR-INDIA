import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setBaggage, setPrice } from "../../hooks/redux/slices/bookingSlice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Backpack, Luggage, Briefcase, Plus, Minus, Info, Check } from "lucide-react";
import { motion } from "framer-motion";

interface BaggageOption {
    id: string;
    name: string;
    weight: number;
    price: number;
    description: string;
    icon: React.ReactNode;
}

const baggageOptions: BaggageOption[] = [
    {
        id: "personal",
        name: "Personal Item",
        weight: 7,
        price: 0,
        description: "Fits under the seat in front of you (e.g. handbag, laptop bag)",
        icon: <Backpack className="w-8 h-8 text-blue-500" />,
    },
    {
        id: "cabin",
        name: "Cabin Baggage",
        weight: 12,
        price: 1500,
        description: "Must fit in the overhead bin (max 55 x 35 x 25 cm)",
        icon: <Briefcase className="w-8 h-8 text-indigo-500" />,
    },
    {
        id: "checked",
        name: "Checked Baggage",
        weight: 23,
        price: 3500,
        description: "Goes into the aircraft hold (max linear dimensions 158 cm)",
        icon: <Luggage className="w-8 h-8 text-purple-500" />,
    },
];

const BaggageSelection: React.FC = () => {
    const [selectedBaggage, setSelectedBaggage] = useState<{ [key: string]: number }>({
        personal: 1,
        cabin: 0,
        checked: 0,
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { seatClass, seatPrice } = location.state || { seatClass: "Economy", seatPrice: 1500 };

    const updateQuantity = (id: string, delta: number) => {
        setSelectedBaggage((prev) => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            // Personal item is usually limited to 1 for free, or fixed
            if (id === 'personal' && next > 1) return prev;
            return { ...prev, [id]: next };
        });
    };

    const calculateTotal = () => {
        return baggageOptions.reduce((total, option) => {
            return total + (selectedBaggage[option.id] * option.price);
        }, 0);
    };

    const handleContinue = () => {
        const finalBaggage = baggageOptions
            .filter(opt => selectedBaggage[opt.id] > 0)
            .flatMap(opt => Array(selectedBaggage[opt.id]).fill({
                id: opt.id,
                name: opt.name,
                weight: opt.weight,
                price: opt.price
            }));

        dispatch(setBaggage(finalBaggage));
        dispatch(setPrice(seatPrice + calculateTotal()));
        navigate("/booking/form", {
            state: {
                seatClass,
                seatPrice,
                baggageTotal: calculateTotal()
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                        Customise Your Travel
                    </h1>
                    <p className="text-lg text-slate-600">
                        Choose the baggage options that best suit your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {baggageOptions.map((option) => (
                        <motion.div
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card className={`h-full flex flex-col border-2 transition-all ${selectedBaggage[option.id] > 0 ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                                }`}>
                                <CardHeader className="text-center">
                                    <div className="mx-auto bg-slate-100 p-4 rounded-full mb-4">
                                        {option.icon}
                                    </div>
                                    <CardTitle className="text-xl font-bold">{option.name}</CardTitle>
                                    <CardDescription className="font-semibold text-slate-700">
                                        Up to {option.weight}kg
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow text-center text-sm text-slate-500">
                                    <p>{option.description}</p>
                                    <p className="mt-4 text-2xl font-bold text-slate-900">
                                        {option.price === 0 ? "FREE" : `₹${option.price}`}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-center items-center gap-4 bg-slate-50/50 py-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => updateQuantity(option.id, -1)}
                                        disabled={selectedBaggage[option.id] === 0 || (option.id === 'personal' && selectedBaggage[option.id] === 1)}
                                        className="rounded-full"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xl font-bold w-6 text-center">
                                        {selectedBaggage[option.id]}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => updateQuantity(option.id, 1)}
                                        disabled={option.id === 'personal' && selectedBaggage[option.id] === 1}
                                        className="rounded-full"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <Card className="bg-white shadow-xl border-none overflow-hidden">
                    <div className="bg-blue-600 p-1"></div>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-slate-900">Selected Summary</h3>
                                <div className="flex flex-wrap gap-4 text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span>Seat: {seatClass}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-500" />
                                        <span>Baggage: {Object.values(selectedBaggage).reduce((a, b) => a + b, 0)} items</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center md:text-right">
                                <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Total Surcharge</p>
                                <p className="text-4xl font-black text-blue-600">₹{calculateTotal()}</p>
                            </div>

                            <Button
                                onClick={handleContinue}
                                className="w-full md:w-auto px-10 py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                Continue to Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BaggageSelection;
