import React, { useState } from 'react';
import { useResumeStore } from '../../store/resumeStore';
import { 
  Mail, Phone, MapPin, Link as LinkIcon, 
  Award, Briefcase, GraduationCap, Edit3, Check, Plus, Trash2, Calendar
} from 'lucide-react';

export default function ResumePreview() {
  const { 
    personalInfo, 
    skills, 
    projects, 
    experience, 
    education, 
    selectedTheme, 
    setSelectedTheme,
    updatePersonalInfo,
    addSkill,
    removeSkill,
    addExperience,
    removeExperience,
    addEducation,
    removeEducation
  } = useResumeStore();

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [newExpRole, setNewExpRole] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpDuration, setNewExpDuration] = useState('');
  const [newExpBullets, setNewExpBullets] = useState('');
  const [showAddExp, setShowAddExp] = useState(false);

  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduSchool, setNewEduSchool] = useState('');
  const [newEduYear, setNewEduYear] = useState('');
  const [showAddEdu, setShowAddEdu] = useState(false);

  const startEditField = (field, currentVal) => {
    setEditingField(field);
    setEditValue(currentVal);
  };

  const saveEditField = (field) => {
    updatePersonalInfo({ [field]: editValue });
    setEditingField(null);
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newExpRole || !newExpCompany) return;
    
    addExperience({
      role: newExpRole,
      company: newExpCompany,
      duration: newExpDuration,
      bullets: newExpBullets.split('\n').map(b => b.trim()).filter(Boolean)
    });

    setNewExpRole('');
    setNewExpCompany('');
    setNewExpDuration('');
    setNewExpBullets('');
    setShowAddExp(false);
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!newEduDegree || !newEduSchool) return;

    addEducation({
      degree: newEduDegree,
      school: newEduSchool,
      year: newEduYear
    });

    setNewEduDegree('');
    setNewEduSchool('');
    setNewEduYear('');
    setShowAddEdu(false);
  };

  // Extract only checked / highlighted projects
  const highlightedProjects = projects.filter(p => p.isHighlighted);

  // Styling maps based on active theme
  const getThemeContainerStyle = () => {
    switch (selectedTheme) {
      case 'vanguard-print':
        return 'bg-white text-zinc-900 border-zinc-200 font-sans shadow-md print:shadow-none print:border-none print:m-0 w-full min-h-[1050px] p-8 max-w-[850px] mx-auto transition-all text-xs';
      case 'cyberpunk-amber':
        return 'bg-zinc-950 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)] w-full min-h-[1050px] p-8 max-w-[850px] mx-auto transition-all text-xs';
      case 'aura-dark':
      default:
        return 'glass-panel text-zinc-100 border border-zinc-800 shadow-2xl w-full min-h-[1050px] p-8 max-w-[850px] mx-auto transition-all text-xs';
    }
  };

  const getThemeTextMuted = () => {
    if (selectedTheme === 'vanguard-print') return 'text-zinc-500';
    if (selectedTheme === 'cyberpunk-amber') return 'text-amber-600/80';
    return 'text-zinc-400';
  };

  const getThemeTitleStyle = () => {
    if (selectedTheme === 'vanguard-print') return 'text-zinc-900 font-bold border-b border-zinc-200 pb-1 mb-3';
    if (selectedTheme === 'cyberpunk-amber') return 'text-amber-400 font-extrabold tracking-widest uppercase border-b border-amber-500/30 pb-1 mb-3';
    return 'text-white font-extrabold tracking-wide uppercase bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent border-b border-zinc-800/80 pb-1.5 mb-3';
  };

  const getThemeHeadingAccent = () => {
    if (selectedTheme === 'vanguard-print') return 'text-zinc-800';
    if (selectedTheme === 'cyberpunk-amber') return 'text-amber-400';
    return 'text-cyan-400';
  };

  const renderEditableInput = (field, type = 'text') => {
    if (editingField === field) {
      return (
        <div className="flex gap-2 items-center flex-1 my-1">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`p-2 text-xs font-semibold rounded-lg bg-zinc-950 border text-zinc-100 focus:outline-none flex-1 focus:border-cyan-500 ${
                selectedTheme === 'vanguard-print' ? 'bg-zinc-100 text-zinc-900 border-zinc-300' : 'border-zinc-800'
              }`}
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`p-1.5 text-xs font-semibold rounded-lg bg-zinc-950 border text-zinc-100 focus:outline-none flex-1 focus:border-cyan-500 ${
                selectedTheme === 'vanguard-print' ? 'bg-zinc-100 text-zinc-900 border-zinc-300' : 'border-zinc-800'
              }`}
            />
          )}
          <button 
            onClick={() => saveEditField(field)}
            className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div 
        onClick={() => startEditField(field, personalInfo[field])}
        className="group relative cursor-pointer hover:bg-zinc-800/10 rounded px-1 -mx-1 transition-colors flex items-center gap-1.5"
      >
        <span>{personalInfo[field]}</span>
        <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity text-cyan-400" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Theme Switcher and Editor Layout Toggles */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 bg-zinc-950/60 p-2 rounded-lg border border-zinc-900 shadow-inner">
        <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-widest pl-2">Select Designer Palette</span>
        <div className="flex gap-1.5">
          <button 
            onClick={() => setSelectedTheme('aura-dark')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
              selectedTheme === 'aura-dark' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Aura Dark (Glass)
          </button>
          <button 
            onClick={() => setSelectedTheme('vanguard-print')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
              selectedTheme === 'vanguard-print' 
                ? 'bg-zinc-800 text-white border border-zinc-700' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Vanguard (Print Perfect)
          </button>
          <button 
            onClick={() => setSelectedTheme('cyberpunk-amber')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
              selectedTheme === 'cyberpunk-amber' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cyberpunk (Amber)
          </button>
        </div>
      </div>

      {/* Main Resume Sheet View (Print & Preview target) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div id="resume-print-target" className={getThemeContainerStyle()}>
          
          {/* Header Row (Name + Contact details) */}
          <div className="border-b border-zinc-800/80 pb-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-extrabold tracking-wide uppercase">
                {renderEditableInput('fullName')}
              </h1>
              <p className={`text-xs font-bold tracking-wider uppercase mt-1 ${getThemeHeadingAccent()}`}>
                {renderEditableInput('jobTitle')}
              </p>
            </div>
            
            {/* Contacts Layout */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-semibold">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                {renderEditableInput('email')}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                {renderEditableInput('phone')}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300 col-span-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                {renderEditableInput('location')}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300 col-span-2">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                {renderEditableInput('website')}
              </div>
            </div>
          </div>

          {/* Profile Summary / Biography Section */}
          <div className="mb-6">
            <h2 className={`text-[10px] ${getThemeTitleStyle()}`}>Executive Bio</h2>
            <p className={`text-[11px] font-medium leading-relaxed ${getThemeTextMuted()}`}>
              {renderEditableInput('bio', 'textarea')}
            </p>
          </div>

          {/* Core Technical Strengths */}
          <div className="mb-6">
            <h2 className={`text-[10px] ${getThemeTitleStyle()}`}>Core Technical Strengths</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-bold">
              <div>
                <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider mb-1.5 block">Languages</span>
                <div className="flex flex-wrap gap-1">
                  {skills.languages.map(lang => (
                    <span 
                      key={lang} 
                      onClick={() => removeSkill('languages', lang)}
                      className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-red-500/10 hover:text-red-400 cursor-pointer border border-zinc-800 text-zinc-300"
                      title="Click to remove"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider mb-1.5 block">Frameworks</span>
                <div className="flex flex-wrap gap-1">
                  {skills.frameworks.map(frm => (
                    <span 
                      key={frm} 
                      onClick={() => removeSkill('frameworks', frm)}
                      className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-red-500/10 hover:text-red-400 cursor-pointer border border-zinc-800 text-zinc-300"
                      title="Click to remove"
                    >
                      {frm}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider mb-1.5 block">Tools & Methods</span>
                <div className="flex flex-wrap gap-1">
                  {skills.tools.map(tool => (
                    <span 
                      key={tool} 
                      onClick={() => removeSkill('tools', tool)}
                      className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-red-500/10 hover:text-red-400 cursor-pointer border border-zinc-800 text-zinc-300"
                      title="Click to remove"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Projects Showcase */}
          <div className="mb-6">
            <h2 className={`text-[10px] ${getThemeTitleStyle()}`}>Selected Professional Showcases</h2>
            <div className="space-y-4">
              {highlightedProjects.map(proj => (
                <div key={proj.id} className="relative">
                  <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        {proj.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-zinc-800 text-zinc-400 border border-zinc-700/50 uppercase">
                        {proj.language}
                      </span>
                      {proj.custom && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                          Custom Project
                        </span>
                      )}
                    </div>
                    {proj.githubUrl && (
                      <a 
                        href={proj.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        Source <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <p className={`text-[10px] font-semibold leading-relaxed mb-2 ${getThemeTextMuted()}`}>
                    {proj.description}
                  </p>
                  
                  {/* Advantages list for resume print */}
                  <ul className="space-y-1 pl-4">
                    {proj.advantages.map((adv, i) => (
                      <li key={i} className={`text-[10px] font-semibold leading-normal list-disc ${getThemeTextMuted()}`}>
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {highlightedProjects.length === 0 && (
                <p className="text-[10px] font-bold text-zinc-500">No projects highlighted. Toggle them on in the selector sidebar.</p>
              )}
            </div>
          </div>

          {/* Professional Work Experience */}
          <div className="mb-6">
            <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1.5 mb-3">
              <h2 className="text-[10px] font-extrabold tracking-wide uppercase text-white mb-0">Professional Experience</h2>
              <button 
                onClick={() => setShowAddExp(!showAddExp)}
                className="text-[9px] font-extrabold text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Job
              </button>
            </div>

            {showAddExp && (
              <form onSubmit={handleAddExperience} className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">Role Title</label>
                    <input 
                      type="text" 
                      required 
                      value={newExpRole} 
                      onChange={(e) => setNewExpRole(e.target.value)} 
                      placeholder="e.g. Lead Developer"
                      className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Company</label>
                    <input 
                      type="text" 
                      required 
                      value={newExpCompany} 
                      onChange={(e) => setNewExpCompany(e.target.value)} 
                      placeholder="e.g. Hiam Co."
                      className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Duration</label>
                    <input 
                      type="text" 
                      value={newExpDuration} 
                      onChange={(e) => setNewExpDuration(e.target.value)} 
                      placeholder="e.g. 2024 - Present"
                      className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Role highlights (one per line)</label>
                  <textarea 
                    value={newExpBullets} 
                    onChange={(e) => setNewExpBullets(e.target.value)} 
                    placeholder="Led development of x86 kernels..."
                    rows={2}
                    className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddExp(false)} className="px-3 py-1 bg-zinc-800 rounded text-zinc-300 font-bold">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-cyan-600 rounded text-white font-bold">Add Job</button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id} className="relative group">
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-0 right-0 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded cursor-pointer transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex justify-between items-start mb-1 flex-wrap">
                    <div>
                      <h3 className="text-xs font-bold text-white">{exp.role}</h3>
                      <span className={`text-[10px] font-bold ${getThemeHeadingAccent()}`}>{exp.company}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-600" />
                      {exp.duration}
                    </span>
                  </div>
                  <ul className="space-y-1 pl-4">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className={`text-[10px] font-semibold leading-normal list-disc ${getThemeTextMuted()}`}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education Block */}
          <div>
            <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1.5 mb-3">
              <h2 className="text-[10px] font-extrabold tracking-wide uppercase text-white mb-0">Academic Qualifications</h2>
              <button 
                onClick={() => setShowAddEdu(!showAddEdu)}
                className="text-[9px] font-extrabold text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Edu
              </button>
            </div>

            {showAddEdu && (
              <form onSubmit={handleAddEducation} className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">Degree Title</label>
                    <input 
                      type="text" 
                      required 
                      value={newEduDegree} 
                      onChange={(e) => setNewEduDegree(e.target.value)} 
                      placeholder="e.g. MS Computer Science"
                      className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Institution</label>
                    <input 
                      type="text" 
                      required 
                      value={newEduSchool} 
                      onChange={(e) => setNewEduSchool(e.target.value)} 
                      placeholder="e.g. MIT"
                      className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Graduation Year</label>
                    <input 
                      type="text" 
                      value={newEduYear} 
                      onChange={(e) => setNewEduYear(e.target.value)} 
                      placeholder="e.g. 2022"
                      className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddEdu(false)} className="px-3 py-1 bg-zinc-800 rounded text-zinc-300 font-bold">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-cyan-600 rounded text-white font-bold">Add Degree</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map(edu => (
                <div key={edu.id} className="relative group p-2.5 rounded bg-zinc-950/20 border border-zinc-800/40">
                  <button 
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-1.5 right-1.5 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded cursor-pointer transition-opacity animate-fadeIn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <h3 className="text-xs font-bold text-white leading-normal">{edu.degree}</h3>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold mt-1">
                    <span className="truncate">{edu.school}</span>
                    <span className="text-zinc-500">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
