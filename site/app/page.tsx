import Image from "next/image";
import portrait from "../public/profile.png";
import { Chat } from "./chat";
import { FloorPlan } from "./floor-plan";
import { Arrow, Book, Branch, Cloud, Compass, Database, GitHub, Globe, Layout, LinkedIn, Mail, Pin, Server } from "./icons";

// Personal data lives in .env.local (never committed). Generic fallbacks keep the
// build working when the file is absent.
const name = process.env.NEXT_PUBLIC_NAME ?? "Name Surname";
const firstName = name.split(" ")[0];
const location = process.env.NEXT_PUBLIC_LOCATION ?? "City, Country";
const companyNow = process.env.NEXT_PUBLIC_CURRENT_COMPANY ?? "Company";
const sector = process.env.NEXT_PUBLIC_COMPANY_ITSECTOR ?? "a software consultancy";
const school = process.env.NEXT_PUBLIC_SCHOOL ?? "School";

const profiles = [
  {
    name: "LinkedIn",
    Icon: LinkedIn,
    handle: process.env.NEXT_PUBLIC_LINKEDIN_HANDLE ?? "",
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
  },
  {
    name: "GitHub",
    Icon: GitHub,
    handle: process.env.NEXT_PUBLIC_GITHUB_HANDLE ?? "",
    href: `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_HANDLE ?? ""}`,
  },
  {
    name: "Email",
    Icon: Mail,
    handle: process.env.NEXT_PUBLIC_EMAIL ?? "",
    href: `mailto:${process.env.NEXT_PUBLIC_EMAIL ?? ""}`,
  },
];

const career = [
  {
    from: "2025",
    to: "Now",
    company: companyNow,
    role: "Backend Developer",
    place: "Porto",
    summary:
      "Backend for IoT platforms that collect and process building data, so facility teams can plan space and fix equipment before it fails.",
    points: [
      "Build and maintain APIs and AWS services",
      "Own database management across PostgreSQL and SQL Server",
      "Ship to AWS: Lambda, S3, RDS, ECS, EC2, Secrets Manager",
    ],
    stack: [".NET", "AWS", "Docker", "PostgreSQL", "SQL Server"],
  },
  {
    from: "2020",
    to: "2025",
    company: process.env.NEXT_PUBLIC_COMPANY_ITSECTOR ?? "Company",
    role: ".NET Developer, SI Consultant",
    place: "Braga",
    summary: "Four and a half years delivering software for banks and insurers in Portugal, Poland and beyond.",
    points: [
      "APIs for bank and insurer mobile apps",
      "Flyer search and competitor tracking for a bank in Poland",
      "Analyst on an insurance company merger",
      "Public portals for banks and insurers",
    ],
    stack: [".NET", "C#", "REST", "SQL Server", "Umbraco", "JavaScript", "jQuery", "HTML", "CSS"],
  },
  {
    from: "2019",
    to: "2020",
    company: process.env.NEXT_PUBLIC_COMPANY_NRNOW ?? "Company",
    role: "Full-stack .NET Developer",
    place: "Braga",
    summary: "New features for RealPeritos, a portal for vehicle investigations and expert examinations.",
    points: [],
    stack: [".NET MVC", "JavaScript", "jQuery", "HTML", "CSS"],
  },
  {
    from: "2017",
    to: "2019",
    company: process.env.NEXT_PUBLIC_COMPANY_F3M ?? "Company",
    role: "Trainee, then Software Developer",
    place: "Braga",
    summary: "Started as a trainee and stayed on as a full-stack developer on two products, ESocial and Produz.",
    points: [],
    stack: [".NET", "SQL Server", "JavaScript", "jQuery", "HTML", "CSS"],
  },
  {
    from: "2013",
    to: "2017",
    company: school,
    role: "BSc, Computer Systems Engineering",
    place: "Barcelos",
    summary: "Where it started.",
    points: [],
    stack: [],
  },
];

const stack = [
  { group: "Backend", Icon: Server, items: ".NET Core, C#, Entity Framework Core, REST APIs, Node.js, Umbraco" },
  { group: "Cloud", Icon: Cloud, items: "AWS (Lambda, S3, RDS, ECS, EC2), Docker" },
  { group: "Data", Icon: Database, items: "PostgreSQL, SQL Server" },
  { group: "Frontend", Icon: Layout, items: "TypeScript, JavaScript, React, jQuery, HTML, CSS, SCSS" },
  { group: "Practice", Icon: Branch, items: "Domain-Driven Design, dependency injection, xUnit, Agile, Git" },
];

const certificates = [
  ["Claude Code: The Practical Guide", "Udemy", "June 2026"],
  ["Understanding TypeScript", "Udemy", "April 2026"],
  ["NodeJS: The Complete Guide (MVC, REST APIs, GraphQL, Deno)", "Udemy", "January 2026"],
  ["Entity Framework Core: A Full Tour", "Udemy", "September 2025"],
  ["ASP.NET Core Development with PostgreSQL & Azure", "Udemy", "June 2025"],
  ["Cloud Fundamentals: AWS Services for C# Developers", "Dometrain", "May 2025"],
  ["Docker for .NET Developers", "Udemy", "May 2025"],
  ["From Zero to Hero: REST APIs in .NET", "Dometrain", "March 2025"],
  ["The Complete ASP.NET Core 9 Course for Busy Developers", "Udemy", "February 2025"],
  ["React 18 for Beginners", "Code With Mosh", "September 2024"],
  ["Unit Testing .NET Applications with xUnit.net & Moq", "Udemy", "May 2024"],
  ["C# Developers: Learn the Art of Writing Clean Code", "Udemy", "September 2022"],
  ["JavaScript Basics for Beginners", "Udemy", "September 2021"],
  ["Dependency Injection in .NET 5 (.NET Core)", "Udemy", "December 2020"],
  ["Entity Framework in Depth: The Complete Guide", "Udemy", "December 2020"],
  ["RESTful API with ASP.NET Core Web API: Create and Consume", "Udemy", "December 2020"],
  ["C# Advanced Topics: Prepare for Technical Interviews", "Udemy", "November 2020"],
  ["C# Intermediate: Classes, Interfaces and OOP", "Udemy", "September 2020"],
  ["C# Basics for Beginners: Learn C# Fundamentals by Coding", "Udemy", "August 2020"],
  ["Agile Software Development with Scrum", "Rumos", "March 2018"],
];

const marquee = [".NET", "C#", "AWS Lambda", "PostgreSQL", "Docker", "SQL Server", "EF Core", "TypeScript", "React", "REST", "DDD", "xUnit", "Umbraco", "ECS", "S3"];

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="bar">
        <a href="#top" className="mark" aria-label={`${firstName}, back to top`}>
          NA
        </a>
        <nav aria-label="Sections">
          <a href="#about">About</a>
          <a href="#career">Career</a>
          <a href="#beyond">Beyond code</a>
          <a href="#contact" className="bar-cta">
            Get in touch
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-top wrap">
            <div className="hero-copy">
              <p className="hero-role">Backend engineer, {location}</p>
              <p className="hero-lede">
                I build the .NET and AWS services that turn raw building data into decisions. Before that, banks and
                insurers, where downtime is not an option.
              </p>
              <div className="hero-links">
                <a className="btn btn-signal" href="#career">
                  See my career <Arrow />
                </a>
                <a className="btn btn-ghost" href={profiles[0].href} target="_blank" rel="noreferrer">
                  <LinkedIn /> LinkedIn
                </a>
                <a className="btn btn-ghost" href={profiles[1].href} target="_blank" rel="noreferrer">
                  <GitHub /> GitHub
                </a>
              </div>
            </div>
            <FloorPlan />
          </div>
          <div className="wrap name-box">
          <h1 className="name" aria-label={name}>
            <span className="name-line">
              <span>{name.split(" ")[0]}</span>
            </span>{" "}
            <span className="name-line">
              <span>{name.split(" ")[1]}</span>
            </span>
          </h1>
          </div>
          <div className="status wrap">
            <span className="live" aria-hidden="true" />
            Currently backend developer at {companyNow}
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...marquee, ...marquee].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        <section className="section" id="about" aria-labelledby="about-h">
          <div className="wrap split">
            <div className="about-side">
              <h2 id="about-h" className="h2">
                About
              </h2>
              <Image
                className="portrait"
                src={portrait}
                alt={`Portrait of ${name}`}
                sizes="(max-width: 860px) 200px, 320px"
                placeholder="blur"
              />
            </div>
            <div>
              <p className="big">
                Software developer since 2017. I like the parts of a system nobody sees: the API contract, the query
                plan, the Lambda that runs at 3am and doesn&apos;t page anyone.
              </p>
              <div className="prose">
                <p>
                  Today I work on IoT platforms at {companyNow}, where sensors across office buildings feed services I build and
                  run on AWS. The data helps teams use space better and repair equipment before it breaks.
                </p>
                <p>
                  Most of my career was in banking and insurance, at {sector}. Regulated, high-stakes domains taught me
                  to value clear boundaries, boring deploys and code the next person can read.
                </p>
                <p>
                  Outside work I keep learning (TypeScript, Node and AI-assisted development lately) and I&apos;ve been a
                  scout for over two decades.
                </p>
              </div>
              <dl className="stack">
                {stack.map((s) => (
                  <div key={s.group}>
                    <dt>
                      <s.Icon /> {s.group}
                    </dt>
                    <dd>{s.items}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="section section-ink" id="career" aria-labelledby="career-h">
          <div className="wrap">
            <h2 id="career-h" className="h2">
              Career
            </h2>
            <ol className="timeline">
              {career.map((c, i) => (
                <li key={c.company} className={i === 0 ? "job job-now" : "job"}>
                  <div className="job-years">
                    <span>{c.from}</span>
                    <span className="job-to">{c.to}</span>
                  </div>
                  <div className="job-body">
                    <h3>{c.company}</h3>
                    <p className="job-meta">
                      {c.role}
                      <span className="job-place">
                        <Pin /> {c.place}
                      </span>
                    </p>
                    <p className="job-summary">{c.summary}</p>
                    {c.points.length > 0 && (
                      <ul className="job-points">
                        {c.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    )}
                    {c.stack.length > 0 && (
                      <ul className="tags" aria-label="Technologies">
                        {c.stack.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" id="beyond" aria-labelledby="beyond-h">
          <div className="wrap split">
            <h2 id="beyond-h" className="h2">
              Beyond code
            </h2>
            <div className="beyond">
              <article>
                <h3>
                  <Compass /> Scout since 2001
                </h3>
                <p>
                    Member of {process.env.NEXT_PUBLIC_SCOUT_GROUP ?? "a scout group"}. Chief Scout since 2023. I&apos;ve
                  staffed national camps (ACANAC 2022, ACANUC 2025), spoken at workshops for the Cenáculo of Braga and
                  run communications for Rover Cenas 24.
                </p>
                <p className="muted">Teamwork, logistics for hundreds of people, and staying calm when it rains.</p>
              </article>
              <article>
                <h3>
                  <Book /> Always learning
                </h3>
                <p>{certificates.length} certified courses since 2018, most recently:</p>
                <ul className="learn">
                  {certificates.slice(0, 5).map(([t, by, y]) => (
                    <li key={t}>
                      <span>{t}</span>
                      <span className="muted">
                        {by}, {y}
                      </span>
                    </li>
                  ))}
                </ul>
                <details>
                  <summary>Show {certificates.length - 5} more</summary>
                  <ul className="learn">
                    {certificates.slice(5).map(([t, by, y]) => (
                      <li key={t}>
                        <span>{t}</span>
                        <span className="muted">
                          {by}, {y}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
              <article>
                <h3>
                  <Globe /> Languages
                </h3>
                <p>Portuguese, English, Spanish.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="contact section-ink" id="contact" aria-labelledby="contact-h">
          <div className="wrap">
            <h2 id="contact-h" className="contact-h">
              Let&apos;s build something solid.
            </h2>
            <ul className="profiles">
              {profiles.map((p) => (
                <li key={p.name}>
                  <a href={p.href} target={p.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    <span className="profile-name">
                      <p.Icon /> {p.name}
                    </span>
                    <span className="profile-handle">{p.handle}</span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Chat />
      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} {name}</span>
        <span>{location}</span>
      </footer>
    </>
  );
}
