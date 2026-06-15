import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="w-full border-t border-[rgba(248,250,252,0.1)] bg-[#020817] text-[#c3c6d7] font-sans text-[14px] leading-[22px] mt-auto">
      <div className="mx-auto max-w-[1280px] px-[40px] py-12 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-[24px]">
        {/* Column 1: Brand & Tagline */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4 pr-8">
          <Link to="/" className="group flex items-center gap-2">
            <svg className="text-[#b4c5ff] w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span className="text-[20px] font-bold tracking-tight text-[#b4c5ff]">DocNova</span>
          </Link>
          <p className="mt-2 max-w-sm text-[14px] text-[#c3c6d7]">
            Empowering your workflow with advanced AI Document Intelligence. Convert, organize, and edit with unprecedented speed and accuracy.
          </p>
          {/* Newsletter Signup */}
          <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
            <label className="text-[12px] font-medium text-[#e0e3e5]" htmlFor="newsletter">
              Subscribe to our newsletter
            </label>
            <div className="flex items-center overflow-hidden rounded bg-[rgba(15,23,42,0.6)] backdrop-blur-md border border-[rgba(248,250,252,0.1)] transition-all focus-within:ring-1 focus-within:ring-[#2563eb] focus-within:shadow-[0_0_10px_rgba(37,99,235,0.2)]">
              <input
                className="w-full border-none bg-[#090E1A] px-3 py-2 text-[14px] text-[#e0e3e5] placeholder-[#8d90a0] outline-none"
                id="newsletter"
                placeholder="Enter your email"
                type="email"
              />
              <button className="whitespace-nowrap bg-[#2563eb] px-4 py-2 text-[12px] font-medium text-[#eeefff] transition-colors hover:bg-[#0053db]">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Product */}
        <div className="col-span-1 flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-[#e0e3e5]">Product</h3>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link to="/ai-tools" className="flex items-center gap-2 text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">
                AI Tools
              </Link>
            </li>
            <li>
              <Link to="/convert" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">
                Convert
              </Link>
            </li>
            <li>
              <Link to="/organize" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">
                Organize
              </Link>
            </li>
            <li>
              <Link to="/edit" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">
                Edit
              </Link>
            </li>
            <li>
              <Link to="/ocr" className="flex items-center gap-2 text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">
                OCR <span className="rounded bg-[#2563eb] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-[#eeefff]">New</span>
              </Link>
            </li>
            <li>
              <Link to="/secure" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">
                Secure
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div className="col-span-1 flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-[#e0e3e5]">Resources</h3>
          <ul className="flex flex-col gap-2.5">
            <li><a href="#" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">Pricing</a></li>
            <li><a href="#" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">API</a></li>
            <li><a href="#" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">Help Center</a></li>
            <li><a href="#" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">Blog</a></li>
          </ul>
        </div>

        {/* Column 4: Company */}
        <div className="col-span-1 flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-[#e0e3e5]">Company</h3>
          <ul className="flex flex-col gap-2.5">
            <li><Link to="/about" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">About</Link></li>
            <li><a href="#" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">Careers</a></li>
            <li><Link to="/contact" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">Contact</Link></li>
            <li><Link to="/privacy" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">Terms of Service</Link></li>
            <li><a href="#" className="text-[14px] text-[#c3c6d7] transition-colors duration-200 hover:text-[#b4c5ff]">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[rgba(248,250,252,0.1)] bg-[#090E1A]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-[40px] py-4 md:flex-row">
          {/* Copyright */}
          <p className="text-[12px] font-medium text-[#c3c6d7]">
            © {new Date().getFullYear()} Parth Sharma
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a aria-label="Twitter" className="p-1.5 text-[#c3c6d7] transition-colors hover:text-[#b4c5ff]" href="#">
              <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a aria-label="GitHub" className="p-1.5 text-[#c3c6d7] transition-colors hover:text-[#b4c5ff] flex items-center gap-1.5" href="https://github.com/venom-parth" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
              </svg>
              <span className="text-[12px] font-medium relative -top-[1px]">venom-parth</span>
            </a>
            <a aria-label="LinkedIn" className="p-1.5 text-[#c3c6d7] transition-colors hover:text-[#b4c5ff] flex items-center gap-1.5" href="https://www.linkedin.com/in/parth-sharma-b96661245/" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd"></path>
              </svg>
              <span className="text-[12px] font-medium relative -top-[1px]">Parth Sharma</span>
            </a>
          </div>

          {/* Back to Top */}
          <button
            className="group flex items-center gap-2 text-[12px] font-medium text-[#c3c6d7] transition-colors hover:text-[#b4c5ff]"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to Top
            <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
