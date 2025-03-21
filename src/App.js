import React, { useState } from "react";
import "./App.css";
import sha1 from "js-sha1"; // Import the SHA-1 hashing function

function App() {
	const [password, setPassword] = useState("");
	const [strength, setStrength] = useState(0);
	const [breachCount, setBreachCount] = useState(0);
	const [strengthText, setStrengthText] = useState("");

	const handleCheckPassword = async () => {
		try {
			// Hash the password using SHA-1
			const hashedPassword = sha1(password).toUpperCase();
			const prefix = hashedPassword.substring(0, 5);
			const suffix = hashedPassword.substring(5);

			// Send a request to the HIBP API
			const response = await fetch(
				`https://api.pwnedpasswords.com/range/${prefix}`
			);
			const data = await response.text();

			// Check if the password hash is in the response
			const hashes = data.split("\n");
			let found = false;
			hashes.forEach((hash) => {
				const [suffixHash, count] = hash.split(":");
				if (suffixHash === suffix) {
					setBreachCount(parseInt(count, 10));
					found = true;
				}
			});

			// Update strength and feedback based on breach count
			if (found) {
				setStrengthText("Weak");
				setStrength(2); // Set strength to weak
			} else {
				setStrengthText("Strong");
				setStrength(5); // Set strength to strong
			}
		} catch (error) {
			console.error("Error checking password breach:", error);
		}
	};

	const getStrengthColor = () => {
		if (strength <= 2) return "red";
		if (strength === 3 || strength === 4) return "orange";
		return "green";
	};

	return (
		<div className="App">
			<h1>Password Strength Checker</h1>
			<input
				type="password"
				placeholder="Enter your password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button onClick={handleCheckPassword}>Check Strength</button>

			{strength > 0 && (
				<div className="strength-meter">
					<div
						className="strength-bar"
						style={{
							width: `${(strength / 5) * 100}%`,
							backgroundColor: getStrengthColor(),
						}}
					></div>
				</div>
			)}

			{strengthText && (
				<p className="strength-feedback">
					This password is <strong>{strengthText}</strong>.
				</p>
			)}

			{breachCount > 0 && (
				<p className="breach-warning">
					⚠️ This password has been breached {breachCount} times. Do not use it!
				</p>
			)}
			{strengthText === "Strong" && breachCount === 0 && (
				<p className="strong-password">
					✅ This password is <strong>good</strong>.
				</p>
			)}
		</div>
	);
}

export default App;
