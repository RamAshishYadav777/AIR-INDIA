import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPassengers } from "../../hooks/redux/slices/bookingSlice";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../hooks/redux/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Calendar, Users, ChevronRight, ArrowLeft, Plane, ShieldCheck, Phone } from "lucide-react";
import { motion } from "framer-motion";

const BookingForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const booking = useSelector((state: RootState) => state.booking);

  const [passenger, setPassenger] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassenger({ ...passenger, [e.target.name]: e.target.value });
  };

  const handleGenderChange = (value: string) => {
    setPassenger({ ...passenger, gender: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passenger.name || !passenger.age || !passenger.gender || !passenger.phone) {
      alert("All fields are required!");
      return;
    }

    dispatch(
      setPassengers([
        {
          name: passenger.name,
          age: Number(passenger.age),
          gender: passenger.gender,
          phone: passenger.phone,
        },
      ])
    );

    navigate("/booking/payment");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-8">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-2xl">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Passenger Details</CardTitle>
                    <CardDescription className="text-slate-400">Please provide the primary traveler's information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name (as per Passport)</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                          value={passenger.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Age and Gender Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-semibold text-slate-700">Age</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input
                            id="age"
                            name="age"
                            type="number"
                            placeholder="25"
                            className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                            value={passenger.age}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">Gender</Label>
                        <Select onValueChange={handleGenderChange} value={passenger.gender}>
                          <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Phone Row */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+91 99999 99999"
                          className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                          value={passenger.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        Your data is encrypted and secure.
                      </div>
                      <Button
                        type="submit"
                        className="w-full md:w-auto px-10 py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all rounded-xl"
                      >
                        Proceed to Payment
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: Booking Summary Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-8"
          >
            <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden mb-6">
              <CardHeader className="bg-blue-600 text-white p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Trip Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Flight ID</span>
                    <span className="font-bold text-slate-900">{booking.flightId}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Seat</span>
                    <span className="font-bold text-slate-900 bg-blue-50 px-3 py-1 rounded-full text-blue-700">{booking.seatNumber}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Baggage</span>
                    <span className="font-bold text-slate-900">{booking.baggage.length} Item(s)</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Flight Fare</span>
                      <span>₹{booking.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Seat Selection Fee</span>
                      <span>₹{booking.seatAddon.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Baggage Fees</span>
                      <span>₹{booking.baggage.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl">
                    <div className="flex justify-between items-center text-white">
                      <span className="text-slate-400 font-medium">Total Amount</span>
                      <span className="text-2xl font-black text-blue-400">₹{(booking.price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-slate-50 p-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Modify Selections
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
