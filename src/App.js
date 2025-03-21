import React, { useState, useEffect } from "react";
import "./App.css";
import sha1 from "js-sha1"; // Import the SHA-1 hashing function

function App() {
	const [password, setPassword] = useState("");
	const [strength, setStrength] = useState(0);
	const [breachCount, setBreachCount] = useState(0);
	const [strengthText, setStrengthText] = useState("");
	const [feedbackText, setFeedbackText] = useState(""); // New state for feedback

	// Function to fetch and check password breach on every password change
	useEffect(() => {
		if (password.length > 0) {
			handleCheckPassword();
		}
	}, [password]);

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

			// If not found in the database, it's considered safe
			if (!found) {
				setStrengthText("Safe");
				setStrength(5); // Set strength to safe
				setFeedbackText("This password is safe."); // Update feedback for safe password
			} else {
				setStrengthText("Weak");
				setStrength(1); // Set strength to weak
				setFeedbackText(
					`This password has been breached ${breachCount} times. Do not use it!`
				); // Update feedback for weak password
			}
		} catch (error) {
			console.error("Error checking password breach:", error);
		}
	};

	const getStrengthColor = () => {
		if (strength === 1) return "red"; // Red for weak password
		if (strength === 2 || strength === 3) return "orange"; // Orange for medium strength
		return "green"; // Green for strong password
	};

	const getStrengthWidth = () => {
		// Adjust the width based on strength value (maximum width is 100%)
		if (strength === 1) return "20%"; // Weak password should fill 20% (red)
		if (strength === 2 || strength === 3) return "50%"; // Medium strength fills 50% (orange)
		return "100%"; // Full green for strong password
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleCheckPassword();
		}
	};

	return (
		<div className="App">
			<h1>Password Strength Checker</h1>
			<input
				type="password"
				placeholder="Enter your password"
				value={password}
				onChange={(e) => setPassword(e.target.value)} // Update password state
				onKeyDown={handleKeyDown} // Add event listener for Enter key press
			/>

			{/* Display the strength meter */}
			{strength > 0 && (
				<div className="strength-meter">
					<div
						className="strength-bar"
						style={{
							width: getStrengthWidth(),
							backgroundColor: getStrengthColor(),
						}}
					></div>
				</div>
			)}

			{/* Display the password strength text */}
			{strengthText && (
				<p className="strength-feedback">
					This password is <strong>{strengthText}</strong>.
				</p>
			)}

			{/* Display breach warning if the password has been breached */}
			{breachCount > 0 && <p className="breach-warning">⚠️ {feedbackText}</p>}

			{/* Display safe password message if no breach is found */}
			{strengthText === "Safe" && breachCount === 0 && (
				<p className="safe-password">✅ {feedbackText}</p>
			)}
		</div>
	);
}

export default App;
