"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Video, Users, Star, Bell, MoreHorizontal, User, Home as HomeIcon, Layout, Clock, Settings, CheckCircle2, Zap, MapPin, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { HERO_CONTENT } from './constants';

const SectionBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-neutral-900/50 border border-neutral-800 text-neutral-300 text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-md">
    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
    {children}
  </span>
);

export const HeroSection = ({ onAuthAction }: { onAuthAction: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * HERO_CONTENT.length);
    setCurrentIndex(randomIndex);
  }, []);

  const content = HERO_CONTENT[currentIndex];

  return (
    <section className="relative pt-24 pb-12 lg:pt-48 lg:pb-32 overflow-hidden border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Column: Text & CTA */}
          <div className="lg:w-1/2 text-left">
            <SectionBadge>{content.badge}</SectionBadge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1] sm:leading-[1.1]">
              {content.headingPrefix} <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${content.gradient}`}>
                {content.headingHighlight}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 mb-8 max-w-lg leading-relaxed">
              {content.subheading}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10 flex-wrap">
              <Button 
                 className="bg-white hover:bg-neutral-200 text-black hover:text-white"
                 onClick={onAuthAction}
              >
                <Calendar className="mr-2 w-5 h-5" />
                <p className='text-black hover:text-black'>Book Appointment</p>
              </Button>
              <Button 
                variant="outline" 
                className="border-neutral-700 hover:bg-neutral-800"
                onClick={onAuthAction}
              >
                <Video className="mr-2 w-5 h-5 text-neutral-400" />
                Consult Online
              </Button>
              <a 
                href="/public/doctors"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-neutral-700 hover:bg-neutral-800 h-10 px-4 py-2 rounded-md"
              >
                <Stethoscope className="mr-2 w-5 h-5 text-neutral-400" />
                Find a Doctor
              </a>
            </div>

            {/* Social Proof Mini-section */}
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <div className="flex -space-x-2">
                 {[1,2,3,4].map((i) => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center overflow-hidden">
                      <Users size={12} className="text-neutral-400" />
                   </div>
                 ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-500 gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <span>Trusted by 10,000+ patients</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual/Image */}
          <div className="lg:w-1/2 w-full relative perspective-1000">
            {/* Main Card */}
            <div className="relative z-20 rounded-2xl bg-neutral-900 border border-neutral-800 p-2 shadow-2xl transform transition-transform hover:rotate-y-2 hover:rotate-x-2 duration-500 ease-out">
              <div className="rounded-xl bg-black border border-neutral-800 overflow-hidden aspect-[4/3] relative">
                 {/* Header of Mock Window */}
                 <div className="h-8 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
                   <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                   </div>
                   <div className="mx-auto w-20 sm:w-32 h-4 bg-neutral-800/50 rounded-full"></div>
                 </div>
                 
                 {/* Mock Content: Doctor Dashboard */}
                 <div className="flex h-full bg-neutral-950 text-left">
                    {/* Sidebar */}
                    <div className="w-12 sm:w-1/4 max-w-[50px] sm:max-w-[140px] border-r border-neutral-800 p-2 sm:p-3 flex flex-col gap-1 items-center sm:items-stretch transition-all">
                      {[
                        { icon: <HomeIcon size={16} />, label: "Home", active: false },
                        { icon: <User size={16} />, label: "Profile", active: true },
                        { icon: <Layout size={16} />, label: "Clinic", active: false },
                        { icon: <Clock size={16} />, label: "Queue", active: false },
                        { icon: <Settings size={16} />, label: "Settings", active: false },
                      ].map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-2 rounded-md text-[10px] sm:text-xs transition-colors cursor-pointer justify-center sm:justify-start ${item.active ? 'bg-blue-600/10 text-blue-400 font-medium border border-blue-600/20' : 'text-neutral-500 hover:text-neutral-300'}`}>
                          {item.icon}
                          <span className="truncate hidden sm:inline">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Main Dashboard Area */}
                    <div className="flex-1 overflow-hidden relative">
                       <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-neutral-800/50 to-transparent pointer-events-none"></div>

                       <div className="h-full p-3 sm:p-4 flex flex-col">
                          {/* Profile Card */}
                          <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden mb-3 relative group shrink-0">
                              <div className="h-16 sm:h-20 bg-gradient-to-r from-blue-900 via-blue-800 to-neutral-900 relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                                <div className="absolute top-2 right-2 flex gap-2">
                                   <div className="p-1.5 bg-black/30 backdrop-blur rounded-full text-white cursor-pointer hover:bg-black/50"><Bell size={12} /></div>
                                   <div className="p-1.5 bg-black/30 backdrop-blur rounded-full text-white cursor-pointer hover:bg-black/50"><MoreHorizontal size={12} /></div>
                                </div>
                              </div>
                              
                              <div className="px-3 sm:px-4 pb-3">
                                  <div className="relative flex justify-between items-end -mt-8 mb-2">
                                       <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-950 p-1 ring-4 ring-neutral-950">
                                           <div className="w-full h-full rounded-xl bg-neutral-800 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform">
                                              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 opacity-20"></div>
                                              <User size={24} className="sm:hidden text-neutral-300 relative z-10" />
                                              <User size={32} className="hidden sm:block text-neutral-300 relative z-10" />
                                           </div>
                                           <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-neutral-950 rounded-full"></div>
                                       </div>
                                       <button className="px-3 py-1 bg-white text-black text-[9px] sm:text-[10px] font-bold rounded-full hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10">Edit Profile</button>
                                  </div>
                                  
                                  <div>
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <h3 className="text-sm sm:text-lg font-bold text-white leading-tight">Dr. Sarah Smith</h3>
                                        <CheckCircle2 size={12} className="text-blue-500 fill-blue-500/20" />
                                      </div>
                                      <p className="text-[9px] sm:text-xs text-blue-400 mb-2 font-medium">Cardiologist <span className="text-neutral-600 mx-1">•</span> CarePlus Heart Center</p>
                                      
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] sm:text-[10px] text-neutral-400">
                                          <div className="flex items-center gap-1 bg-neutral-800/50 px-2 py-1 rounded-md">
                                              <Star size={10} className="text-yellow-500 fill-yellow-500" /> 
                                              <span className="text-white font-semibold">4.9</span> 
                                              <span>(2.1k)</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                              <MapPin size={10} /> 
                                              <span className="truncate max-w-[80px] sm:max-w-none">New York, USA</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 shrink-0">
                              <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 sm:p-3 text-center hover:border-neutral-700 transition-colors">
                                 <div className="text-[8px] sm:text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Patients</div>
                                 <div className="text-xs sm:text-sm font-bold text-white">1.5k+</div>
                              </div>
                              <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 sm:p-3 text-center hover:border-neutral-700 transition-colors">
                                 <div className="text-[8px] sm:text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Exp</div>
                                 <div className="text-xs sm:text-sm font-bold text-white">8 Yrs</div>
                              </div>
                              <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 sm:p-3 text-center hover:border-neutral-700 transition-colors">
                                 <div className="text-[8px] sm:text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">Consults</div>
                                 <div className="text-xs sm:text-sm font-bold text-white">24/d</div>
                              </div>
                          </div>

                          {/* About Section */}
                          <div className="mb-3 shrink-0 hidden sm:block">
                             <h4 className="text-[10px] font-semibold text-white mb-1">About</h4>
                             <p className="text-[9px] text-neutral-400 leading-relaxed line-clamp-2">
                                Specialist in interventional cardiology with a focus on preventive care. Dedicated to providing comprehensive heart health solutions.
                             </p>
                          </div>

                          {/* Queue/List Section */}
                          <div className="flex-1 min-h-0 flex flex-col">
                             <div className="flex items-center justify-between mb-2 shrink-0">
                                <h4 className="text-[10px] font-semibold text-white">Today's Queue</h4>
                                <span className="text-[9px] text-blue-400 cursor-pointer hover:underline">View All</span>
                             </div>
                             <div className="space-y-2 overflow-hidden">
                                <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-2 rounded-lg">
                                   <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">JD</div>
                                      <div>
                                         <div className="text-[10px] font-medium text-white">John Doe</div>
                                         <div className="text-[8px] text-neutral-500">Check-up • 10:00 AM</div>
                                      </div>
                                   </div>
                                   <div className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[8px] rounded font-medium">Next</div>
                                </div>
                                <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-2 rounded-lg opacity-60">
                                   <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold">AS</div>
                                      <div>
                                         <div className="text-[10px] font-medium text-white">Alice Smith</div>
                                         <div className="text-[8px] text-neutral-500">Report • 10:30 AM</div>
                                      </div>
                                   </div>
                                   <div className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 text-[8px] rounded font-medium">Waiting</div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Floating Element 1 - Confirmed */}
                 <div className="hidden sm:flex absolute -right-4 top-20 bg-neutral-800 p-3 rounded-lg border border-neutral-700 shadow-xl items-center gap-3 animate-bounce duration-[3000ms]">
                    <div className="w-8 h-8 bg-green-500/20 text-green-500 rounded flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white">Appointment Confirmed</div>
                      <div className="text-neutral-400">Dr. Sarah Smith</div>
                    </div>
                 </div>

                 {/* Floating Element 2 - Live Queue */}
                 <div className="hidden sm:flex absolute -left-4 bottom-10 bg-neutral-800 p-3 rounded-lg border border-neutral-700 shadow-xl items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-blue-500/20 text-blue-500 rounded flex items-center justify-center">
                      <Zap size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white">Live Queue</div>
                      <div className="text-neutral-400">Wait time: 5 mins</div>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
    </section>
  );
};
