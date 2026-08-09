import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Github, Linkedin, Copy, Check, Info, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { personalInfo, socialLinks } from "../data";

// Contact form delivers real email via Formspree (https://formspree.io) — no backend required.
// Setup: create a free Formspree account, create a form, and replace FORMSPREE_ENDPOINT below
// with the endpoint it gives you (looks like "https://formspree.io/f/xxxxxxxx").
// Free tier allows 50 submissions/month, delivered straight to your inbox.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mojgzleq";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "DevOps Engineer",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const rolesList = [
    "DevOps Engineer",
    "SRE / Reliability Engineer",
    "AI Platform / LLM Engineer",
    "Cloud Infrastructure Lead",
    "Other Opportunities"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the field-level error as soon as the user starts typing.
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(personalInfo.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleRevealPhone = () => {
    setShowPhone(true);
    try {
      navigator.clipboard.writeText(personalInfo.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (_) {}
  };

  const maskPhone = (phone: string) => {
    // mask all digits except last 4
    return phone.replace(/\d(?=\d{4})/g, '•');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields and collect per-field errors.
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) nextErrors.message = "Message is required.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          message: formData.message
        })
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setSubmitSuccess(true);
      setFormData({ name: "", email: "", role: "DevOps Engineer", message: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-950 border-t border-gray-900/40 relative overflow-hidden">
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[110px] pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center md:text-left max-w-3xl mx-auto"
        >
          <span className="font-mono text-xs text-accent tracking-widest uppercase font-medium">
            Let's Collaborate
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2 tracking-tight">
            Contact & Gateway Credentials
          </h2>
          <div className="h-1 w-12 bg-accent mx-auto md:mx-0 mt-4 rounded-full" />
          <p className="text-sm text-gray-400 mt-3">Use this form to send a message or share credentials — recruiters and collaborators welcome.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left panel: Info cards */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-display font-bold text-white tracking-tight leading-snug text-center md:text-left">
                Establish Direct Connectivity
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                If you are looking to hire for an SRE, DevOps, Platform, or AI operations role, feel free to send a gateway packet using the form, or reach out directly using the certified credentials below.
              </p>

              {/* Clipboard contact items */}
              <div className="space-y-3.5 pt-4">
                {/* Email item */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-950 border border-gray-900 hover:border-accent/20 group transition-all">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-accent/10 rounded-lg text-accent">
                      <Mail size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">SECURE EMAIL</span>
                      <span className="text-sm text-white font-medium block mt-0.5">{personalInfo.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1.5 hover:bg-gray-900 border border-transparent hover:border-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Phone item */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-950 border border-gray-900/80 hover:border-accent/20 group transition-all">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-accent/10 rounded-lg text-accent">
                      <Phone size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">CELLULAR TELEPHONY</span>
                      <span className="text-sm text-white font-medium block mt-0.5">{showPhone ? personalInfo.phone : maskPhone(personalInfo.phone)}</span>
                      {!showPhone && <div className="text-[11px] text-gray-500 mt-1">Tap Reveal to show the number (helps reduce scraping)</div>}
                    </div>
                  </div>
                  {!showPhone ? (
                    <button
                      onClick={handleRevealPhone}
                      className="px-3 py-1 text-xs bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="Reveal Phone"
                    >
                      Reveal
                    </button>
                  ) : (
                    <button
                      onClick={handleCopyPhone}
                      className="p-1.5 hover:bg-gray-900 border border-transparent hover:border-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedPhone ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>

                {/* Location item */}
                <div className="flex items-center p-4 rounded-xl bg-gray-950 border border-gray-900/60 font-sans">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-accent/10 rounded-lg text-accent">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">ACTIVE STATION</span>
                      <span className="text-sm text-white font-medium block mt-0.5">{personalInfo.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social shortcuts footer block */}
            <div className="pt-6 border-t border-gray-900/60">
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block font-bold mb-4 text-center md:text-left">
                External Integrations
              </span>
              <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-gray-950 border border-gray-900 hover:border-accent/30 hover:bg-accent/[0.02] text-gray-400 hover:text-accent font-sans text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-gray-950 border border-gray-900 hover:border-accent/30 hover:bg-accent/[0.02] text-gray-400 hover:text-accent font-sans text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Github size={14} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right panel: Live Message Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-[#060911]/80 backdrop-blur-md border border-gray-900/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-between glass-panel relative overflow-hidden group hover:border-accent/10 transition-all duration-300"
          >
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-all duration-500" />
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block">
                    Your Name / Identity
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className={`w-full bg-gray-950 border text-base sm:text-sm text-gray-200 px-4 py-2.5 rounded-lg transition-all outline-none ${
                      errors.name
                        ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                        : "border-gray-800 hover:border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent/20"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-400 font-sans">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block">
                    Gateway Return Email
                  </label>
                  <div className="text-[11px] text-gray-500 mt-1">Where we can send a reply (your contact email)</div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className={`w-full bg-gray-950 border text-base sm:text-sm text-gray-200 px-4 py-2.5 rounded-lg transition-all outline-none ${
                      errors.email
                        ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                        : "border-gray-800 hover:border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent/20"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-400 font-sans">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Subject role */}
              <div className="space-y-1.5">
                <label htmlFor="role" className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block">
                  Project Domain / Target Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full appearance-none bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent/20 text-base sm:text-sm text-gray-200 px-4 py-2.5 rounded-lg transition-all outline-none pr-10"
                    aria-label="Project Domain or Target Role"
                  >
                    {rolesList.map((role) => (
                      <option key={role} value={role} className="bg-gray-950 text-gray-300">
                        {role}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <ChevronDown size={16} />
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block">
                  Transmission Packet / Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  className={`w-full bg-gray-950 border text-base sm:text-sm text-gray-200 px-4 py-2.5 rounded-lg transition-all outline-none resize-none ${
                    errors.message
                      ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                      : "border-gray-800 hover:border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent/20"
                  }`}
                />
                {errors.message && (
                  <p className="text-[11px] text-red-400 font-sans">{errors.message}</p>
                )}
              </div>

              {/* Feedback messages */}
              {submitSuccess && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-start space-x-2.5 text-xs font-sans">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Transmission Successful!</span>
                    <span className="block mt-0.5">Your message has been delivered to Digambar's inbox. Thank you — expect a reply soon!</span>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start space-x-2.5 text-xs font-sans">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Transmission Failed</span>
                    <span className="block mt-0.5">Something went wrong sending your message — please email {personalInfo.email} directly instead.</span>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-gray-950 font-sans font-bold rounded-lg shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase text-xs tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4.5 h-4.5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Payload...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Transmit Gateway Packet</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
