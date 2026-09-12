import { useEffect, useState } from 'react'
import {
  Award,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronDown,
  Code2,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  GraduationCap,
  HeartPulse,
  BriefcaseBusiness,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react'

const navItems = ['About', 'Skills', 'Experience', 'Projects', 'Education', 'Certifications', 'Resume', 'Contact']

const snapshot = [
  { value: 9.05, suffix: ' / 10', label: 'CGPA', icon: BarChart3 },
  { value: 96, suffix: '%', label: 'PU Score', icon: Award },
  { value: 98.88, suffix: '%', label: 'SSLC Score', icon: GraduationCap },
  { value: 5, suffix: '+', label: 'Certifications', icon: FileText },
]

const skills = [
  { title: 'Programming Languages', icon: Code2, items: ['C', 'C++', 'Python'], tone: 'cyan' },
  { title: 'Technical Areas', icon: BrainCircuit, items: ['Data Structures & Algorithms', 'Software Engineering', 'Artificial Intelligence', 'Computer Networks'], tone: 'violet' },
  { title: 'Soft Skills', icon: Users, items: ['Project Management', 'Team Leadership', 'Critical Thinking', 'Attention to Detail', 'Coordination'], tone: 'gold' },
  { title: 'Languages', icon: MessageCircle, items: ['English', 'Kannada'], tone: 'rose' },
]

const education = [
  { year: '2022 - Present', school: 'Nitte Meenakshi Institute of Technology, Bengaluru', course: 'B.E. in Information Science and Engineering', score: '9.05', unit: 'CGPA / 10', current: true },
  { year: '2020 - 2022', school: 'Sapthagiri PU College, Tumkur', course: 'Karnataka PU Board', score: '96%', unit: 'Percentage' },
  { year: 'Until 2020', school: 'Sri Siddaganga English Medium High School, Tumkur', course: 'Karnataka SSLC Board', score: '98.88%', unit: 'Percentage' },
]

const certifications = [
  { number: '01', title: 'Additive Manufacturing Designer and Industry 4.0', detail: 'Professional certification' },
  { number: '02', title: 'Data Structures and Algorithms', detail: 'Infosys Springboard' },
  { number: '03', title: 'Certificate of Participation', detail: 'Smart India Hackathon' },
  { number: '04', title: 'Software Engineering', detail: 'Infosys Springboard' },
  { number: '05', title: 'Computer Networks', detail: 'Cisco' },
]

const experience = [
  { type: 'Internship', title: 'Artificial Intelligence Intern', organization: 'Eduversity', detail: 'Completed internship experience in Artificial Intelligence.' },
]

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  )
}

function LetterReveal({ children, className = '', startDelay = 0 }) {
  return (
    <span className={`letter-reveal ${className}`} aria-label={children}>
      {children.split('').map((letter, index) => (
        <span aria-hidden="true" style={{ '--letter-delay': `${startDelay + index * 160}ms` }} key={`${letter}-${index}`}>
          {letter === ' ' ? '\u00a0' : letter}
        </span>
      ))}
    </span>
  )
}

function RecruiterSnapshot() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: .25 })
    const section = document.querySelector('#snapshot')
    if (section) observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="snapshot page-section" id="snapshot">
      <div className="snapshot-heading"><SectionHeading eyebrow="01 / Recruiter snapshot" title="A quick read on my journey" /><span className="snapshot-note">Academic focus<br />+ practical curiosity</span></div>
      <div className="snapshot-grid">
        {snapshot.map(({ value, suffix, label, icon: Icon }, index) => (
          <article className={`snapshot-card ${visible ? 'is-visible' : ''}`} style={{ '--delay': `${index * 90}ms` }} key={label}>
            <Icon size={19} />
            <strong>{visible ? value : 0}<small>{suffix}</small></strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="site-shell">
      <div className="noise" aria-hidden="true" />
      <header className="navbar">
        <a href="#top" className="brand" onClick={closeMenu}>
          <span className="brand-mark">V</span>
          <span>Vikas Patel <b>KR</b></span>
        </a>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          {navItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={closeMenu}>{item}</a>)}
          <a className="nav-cta" href="#contact" onClick={closeMenu}>Let's talk <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <main id="top">
        <section className="hero page-section">
          <div className="hero-copy">
            <div className="status-pill"><span className="status-dot" /> Open to learning and opportunities</div>
            <p className="hero-kicker">Information Science & Engineering student <span>·</span> aspiring software engineer <span>·</span> AI enthusiast</p>
            <h1><LetterReveal>Hi, I'm Vikas Patel KR</LetterReveal><br /><span><LetterReveal startDelay={3900}>Aspiring software Engineer.</LetterReveal></span></h1>
            <p className="hero-intro">Passionate about programming, problem solving, software engineering and Artificial Intelligence.</p>
            <p className="hero-tagline">Building my skills. Solving problems. Creating with technology.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">View my projects <ArrowUpRight size={17} /></a>
              <a className="button button-quiet" href="#resume">Download resume <Download size={16} /></a>
            </div>
            <div className="hero-socials"><a href="#github">GitHub</a><a href="#linkedin">LinkedIn</a><a href="#leetcode">LeetCode</a><a href="mailto:vikaspatelkr.12@gmail.com">Email</a></div>
          </div>
          <div className="hero-visual" aria-label="Profile photo placeholder">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="profile-placeholder">
              <img src="/profile.jpg" alt="Vikas Patel KR" />
            </div>
            <div className="float-card float-card-top"><Sparkles size={16} /><span>Curious<br /><b>by nature</b></span></div>
            <div className="float-card float-card-bottom"><Target size={16} /><span>Learning with<br /><b>intention</b></span></div>
          </div>
          <div className="hero-scroll"><span>Scroll to explore</span><ChevronDown size={17} /></div>
        </section>

        <RecruiterSnapshot />

        <section className="about page-section" id="about">
          <div className="about-label"><span className="eyebrow">01 / About me</span><span className="vertical-line" /></div>
          <div className="about-content">
            <SectionHeading eyebrow="A little context" title={<>Student today.<br /><em>Engineer in the making.</em></>}>
              I am an Information Science and Engineering student building strong foundations in programming, Data Structures & Algorithms, Software Engineering and Artificial Intelligence. I enjoy solving problems, learning continuously and turning what I learn into practical projects.
            </SectionHeading>
            <div className="about-notes">
              <div className="note"><span>01</span><p>Software<br />development</p></div>
              <div className="note"><span>02</span><p>Artificial<br />intelligence</p></div>
              <div className="note"><span>03</span><p>Problem<br />solving</p></div>
            </div>
          </div>
        </section>

        <section className="skills page-section" id="skills">
          <SectionHeading eyebrow="02 / Capabilities" title="The tools I am growing with" />
          <div className="skills-grid">
            {skills.map(({ title, icon: Icon, items, tone }) => (
              <article className={`skill-card ${tone}`} key={title}>
                <div className="card-icon"><Icon size={21} /></div>
                <h3>{title}</h3>
                <ul>{items.map((item) => <li key={item}><Check size={14} /> {item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="experience page-section" id="experience">
          <SectionHeading eyebrow="03 / Experience" title="Experience that shaped my direction" />
          <div className="experience-list">
            {experience.map((item) => (
              <article className="experience-card" key={item.organization}>
                <div className="experience-icon"><Lightbulb size={22} /></div>
                <div><span className="project-type">{item.type}</span><h3>{item.title}</h3><p className="experience-organization">{item.organization}</p><p>{item.detail}</p></div>
                <span className="experience-status">Completed</span>
              </article>
            ))}
          </div>
        </section>

        <section className="education page-section" id="education">
          <SectionHeading eyebrow="03 / Education" title="A strong foundation" />
          <div className="timeline">
            {education.map((item) => (
              <article className={`education-item ${item.current ? 'current' : ''}`} key={item.school}>
                <div className="timeline-marker"><GraduationCap size={18} /></div>
                <div className="education-main"><span className="timeline-year">{item.year}</span><h3>{item.school}</h3><p>{item.course}</p></div>
                <div className="score"><strong>{item.score}</strong><span>{item.unit}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="projects page-section" id="projects">
          <div className="project-heading"><SectionHeading eyebrow="04 / Selected project" title="Projects That Showcase My Skills" /><span className="project-count">01 <span>of</span> 01</span></div>
          <article className="project-feature">
            <div className="project-art"><div className="art-grid" /><div className="pulse-line" /><div className="health-orb"><HeartPulse size={37} /></div><span className="art-label">AI / NLP</span></div>
            <div className="project-info"><span className="project-type">Artificial Intelligence / NLP</span><h3>AI Disease &<br /><em>Health Chatbot</em></h3><p>Developed an AI-based chatbot to provide information about diseases and health conditions. It uses Natural Language Processing (NLP) to understand user queries and provide relevant responses. The system helps users quickly access basic health awareness and guidance.</p><div className="project-points"><div><strong>Problem</strong><span>Making basic health awareness easier to access.</span></div><div><strong>Solution</strong><span>A conversational interface for relevant responses to user queries.</span></div></div><div className="tag-list"><span>Artificial Intelligence</span><span>Natural Language Processing</span></div><div className="project-actions"><a className="button button-dark" href="#project-github">GitHub <GitBranch size={16} /></a><a className="text-link" href="#project-demo">Live demo <ExternalLink size={15} /></a></div></div>
          </article>
        </section>

        <section className="certifications page-section" id="certifications">
          <SectionHeading eyebrow="05 / Certifications" title="Milestones along the way" />
          <div className="cert-grid">{certifications.map((cert) => <article className="cert-card" key={cert.number}><span className="cert-number">{cert.number}</span><div className="cert-seal">✦</div><h3>{cert.title}</h3><p>{cert.detail}</p><ArrowUpRight className="cert-arrow" size={18} /></article>)}</div>
        </section>

        <section className="goal page-section" id="goal"><div className="goal-mark"><Target size={30} /></div><div><span className="eyebrow">06 / Direction</span><h2>What I'm Looking For</h2><p>I am looking for opportunities where I can apply my programming and problem-solving skills, learn from experienced professionals, contribute to real-world projects and grow as a software engineer.</p><a className="button button-light" href="#contact">Let's connect <ArrowUpRight size={16} /></a></div></section>

        <section className="resume-cta page-section" id="resume"><div><span className="eyebrow">07 / Resume</span><h2>Want to know more about me?</h2><p>Download my resume to explore my education, skills, projects and certifications.</p></div><a className="button button-primary" href="#resume-download"><Download size={17} /> Download resume</a></section>

        <section className="contact page-section" id="contact">
          <div className="contact-copy"><SectionHeading eyebrow="08 / Get in touch" title={<>Let's make<br /><em>something meaningful.</em></>}><span>Whether it is an idea, an opportunity, or simply a conversation about technology, I would be happy to hear from you.</span></SectionHeading><div className="contact-details"><a href="mailto:vikaspatelkr.12@gmail.com"><Mail size={18} /> vikaspatelkr.12@gmail.com</a><a href="tel:+919008032157"><Phone size={18} /> +91 9008032157</a><span><MapPin size={18} /> Tumkur, Karnataka</span></div><div className="social-links"><a href="#linkedin" aria-label="LinkedIn placeholder"><BriefcaseBusiness size={18} /></a><a href="#github" aria-label="GitHub placeholder"><GitBranch size={18} /></a><a href="#leetcode" aria-label="LeetCode placeholder"><Code2 size={18} /></a></div></div>
          <form className="contact-form" onSubmit={handleSubmit}><label>Name<input name="name" placeholder="Your name" required /></label><label>Email<input name="email" type="email" placeholder="you@example.com" required /></label><label>Message<textarea name="message" placeholder="Tell me a little about it..." rows="4" required /></label><button className="button button-primary" type="submit">{submitted ? 'Message ready' : 'Send message'} <Send size={16} /></button>{submitted && <p className="form-note">Thanks. This form is a placeholder and is ready to connect to a backend.</p>}</form>
        </section>
      </main>

      <footer className="footer"><a href="#top" className="brand"><span className="brand-mark">V</span><span>Vikas Patel <b>KR</b></span></a><p>Learning. Building. Becoming.</p><span className="footer-note">© 2025 Vikas Patel KR</span></footer>
    </div>
  )
}

export default App
