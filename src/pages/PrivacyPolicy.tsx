import React from "react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-gray-400 mt-1">Effective date: <strong>September 8, 2025</strong></p>
          <p className="text-gray-400">Brand: <strong>Instantlly Cards</strong> — <a className="text-blue-400 underline" href="https://www.instantllycards.com" target="_blank">www.instantllycards.com</a></p>
        </header>

        <section className="space-y-8">
          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li><span className="font-medium text-gray-200">Account data:</span> name, email, and profile details you provide.</li>
              <li><span className="font-medium text-gray-200">Cards data:</span> business card content you create, save, or share.</li>
              <li><span className="font-medium text-gray-200">Usage & device data:</span> app actions, IP, device/browser info for security and analytics.</li>
              <li><span className="font-medium text-gray-200">Communications:</span> messages or emails you send to support.</li>
            </ul>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Information</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Provide and improve Instantly Cards features and services.</li>
              <li>Create and manage your account and saved cards.</li>
              <li>Respond to support requests and send service notifications.</li>
              <li>Protect against fraud, abuse, or security incidents; comply with law.</li>
            </ul>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">3. Sharing of Information</h2>
            <p>We do <span className="font-semibold">not</span> sell your personal data. We may share data with trusted processors (hosting, email delivery, analytics) under contracts, and with authorities when legally required.</p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">4. Data Retention</h2>
            <p>We keep data only as long as necessary to provide the service and meet legal obligations. Certain records (e.g., billing or security logs) may be retained for up to <strong>90 days</strong> after deletion for compliance and fraud prevention.</p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">5. Your Rights & Account Deletion</h2>
            <p>
              You may request access, correction, or deletion of your data. To delete your account, visit our{" "}
              <a className="text-blue-400 underline" href="/delete-account">Delete Account</a> page
              {" "}or email <a className="text-blue-400 underline" href="mailto:support@instantlycards.com">support@instantlycards.com</a>.
            </p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">6. Cookies & Tracking</h2>
            <p>We use cookies or similar technologies to keep you signed in, remember preferences, and analyze traffic. You can control cookies via your browser settings; turning some off may affect features.</p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">7. Security</h2>
            <p>We apply technical and organizational safeguards (encryption in-transit, access controls). No method is 100% secure, but we work to protect your data against unauthorized access.</p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">8. Children’s Privacy</h2>
            <p>The service is not directed to children under 13. If we learn we’ve collected data from a child, we will delete it.</p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">9. Changes to this Policy</h2>
            <p>We may update this policy periodically. We will post the updated version here and adjust the “Effective date.”</p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">10. Contact Us</h2>
            <p>
              Questions about privacy? Contact:<br />
              <span className="font-medium">Instantlly Cards – Support</span><br />
              <a className="text-blue-400 underline" href="mailto:support@instantlycards.com">support@instantlycards.com</a><br />
              <a className="text-blue-400 underline" href="https://www.instantllycards.com" target="_blank">www.instantllycards.com</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
