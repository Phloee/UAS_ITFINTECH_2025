// @ts-nocheck
export default function Footer() {
  return (
    <footer className="footer">
      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #E8D56D 0%, #5FB3A3 100%);
          color: white;
          padding: var(--spacing-2xl) 0 var(--spacing-lg);
          margin-top: var(--spacing-3xl);
        }
        
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-lg);
          text-align: center;
        }
        
        .footer h3 {
          font-size: 1.5rem;
          margin-bottom: var(--spacing-md);
        }
        
        .footer p {
          opacity: 0.9;
          margin-bottom: var(--spacing-sm);
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
          margin: var(--spacing-lg) 0;
        }
        
        .footer-link {
          opacity: 0.9;
          transition: opacity var(--transition-base);
        }
        
        .footer-link:hover {
          opacity: 1;
        }
        
        .footer-bottom {
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-lg);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 0.875rem;
          opacity: 0.8;
        }
      `}</style>

      <div className="footer-content">
        <h3>ScentFix</h3>
        <p>Premium shoe deodorant patches for fresh, odor-free shoes.</p>

        <div className="footer-links">
          <a href="#" className="footer-link">About Us</a>
          <a href="#" className="footer-link">Contact</a>
          <a href="#" className="footer-link">FAQ</a>
          <a href="#" className="footer-link">Shipping</a>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ScentFix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
