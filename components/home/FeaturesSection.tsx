"use client";
import React from 'react';
import { Clock, Video, Calendar, MapPin, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueueWidget } from './QueueWidget';

export const FeaturesSection = ({ onAuthAction }: { onAuthAction: () => void }) => (
  <section id="features" className="py-24 bg-black relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Complete Healthcare at Your Fingertips.</h2>
        <p className="text-lg text-neutral-400">
          From real-time queue tracking to instant video consultations, manage your entire medical journey in one app.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
        {/* Large Item - Live Queue Status */}
        <div className="md:col-span-2 row-span-2 rounded-2xl bg-neutral-950 border border-neutral-800 p-8 relative overflow-hidden group hover:border-neutral-700 transition-colors flex flex-col">
          <div className="absolute top-8 right-8 p-3 bg-neutral-900 rounded-xl border border-neutral-800 z-20">
            <Clock className="w-6 h-6 text-white" />
          </div>
          
          {/* Queue Simulation Widget */}
          <div className="flex-1 flex items-center justify-center relative z-10 pt-4 pb-8">
              <QueueWidget />
          </div>

          <div className="relative z-10 mt-auto">
            <h3 className="text-2xl font-bold text-white mb-2">Live Queue Status</h3>
            <p className="text-neutral-400 max-w-md">Track your position in line from home. Receive real-time updates and arrive at the clinic exactly when it's your turn, eliminating the wait.</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Small Items */}
        <div 
          onClick={onAuthAction}
          className="rounded-2xl bg-neutral-950 border border-neutral-800 p-8 relative overflow-hidden group hover:border-neutral-700 transition-colors cursor-pointer"
        >
           <Video className="w-8 h-8 text-purple-500 mb-4" />
           <h3 className="text-xl font-bold text-white mb-2">Online Consultancy</h3>
           <p className="text-neutral-400 text-sm">Secure HD video consultations with top specialists from the comfort of your home.</p>
        </div>

        <div 
          onClick={onAuthAction}
          className="rounded-2xl bg-neutral-950 border border-neutral-800 p-8 relative overflow-hidden group hover:border-neutral-700 transition-colors cursor-pointer"
        >
           <Calendar className="w-8 h-8 text-green-500 mb-4" />
           <h3 className="text-xl font-bold text-white mb-2">Instant Booking</h3>
           <p className="text-neutral-400 text-sm">Schedule appointments instantly. View doctor availability and book slots that work for you.</p>
        </div>

        {/* Medium Item */}
        <div className="md:col-span-3 rounded-2xl bg-neutral-950 border border-neutral-800 p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden hover:border-neutral-700 transition-colors">
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                 <MapPin className="w-6 h-6 text-red-500" />
                 <h3 className="text-2xl font-bold text-white">Clinic Locator & Maps</h3>
              </div>
              <p className="text-neutral-400 mb-6">Find the nearest clinics and specialists with integrated maps. Get directions and check facility timings instantly.</p>
               <a 
                 href="/public/clinics"
                 className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md"
               >
                 Find Clinics Nearby
               </a>
           </div>
           
           {/* Map Mockup Container */}
           <div className="flex-1 w-full h-48 bg-[#1a1a1a] rounded-xl border border-neutral-800 flex items-center justify-center relative overflow-hidden group cursor-default">
               {/* Map Background Pattern */}
               <div className="absolute inset-0 opacity-50">
                  <div className="absolute h-full w-8 bg-[#111] left-1/3 border-x border-neutral-800/50"></div>
                  <div className="absolute h-full w-6 bg-[#111] right-1/4 border-x border-neutral-800/50"></div>
                  <div className="absolute w-full h-8 bg-[#111] top-1/3 border-y border-neutral-800/50"></div>
                  <div className="absolute w-full h-6 bg-[#111] bottom-1/4 border-y border-neutral-800/50"></div>
                  <div className="absolute w-16 h-16 bg-green-900/10 rounded-lg top-4 left-4 border border-green-900/20"></div>
                  <div className="absolute w-24 h-24 bg-blue-900/10 rounded-full -bottom-8 -right-8 border border-blue-900/20"></div>
               </div>

               {/* Map Pin & Tooltip */}
              <div className="absolute top-1/2 left-1/3 z-10 group-hover:-translate-y-1 transition-transform duration-300">
                <div className="relative flex flex-col items-center">
                  
                  {/* Tooltip Card */}
                  <div className="absolute bottom-full mb-3 whitespace-nowrap opacity-100 transition-all duration-300 transform translate-y-0">
                      <div className="bg-white text-black p-2 rounded-lg shadow-xl flex items-center gap-3 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <div className="w-10 h-10 bg-neutral-100 rounded-md flex items-center justify-center shrink-0">
                            <Stethoscope size={20} className="text-blue-600" />
                         </div>
                         <div>
                            <div className="text-[10px] font-bold leading-tight">CarePlus Clinic</div>
                            <div className="text-[9px] text-neutral-500 font-medium flex items-center gap-1">
                               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                               Open Now • 0.8 mi
                            </div>
                         </div>
                         <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                      </div>
                  </div>

                  {/* Pin Icon */}
                  <div className="relative hover:scale-110 transition-transform cursor-pointer">
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <MapPin className="w-8 h-8 text-white fill-red-500 drop-shadow-xl" />
                    <div className="w-6 h-1.5 bg-black/50 blur-[2px] rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                  </div>

                </div>
              </div>
              
              {/* Other Pins */}
              <MapPin size={16} className="absolute top-1/4 right-1/4 text-neutral-600 fill-neutral-800" />
              <MapPin size={16} className="absolute bottom-1/3 left-1/4 text-neutral-600 fill-neutral-800" />

           </div>
        </div>
      </div>
    </div>
  </section>
);
