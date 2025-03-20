import React, { useState } from "react";
import "./App.css";

function App() {
	const [password, setPassword] = useState("");
	const [strength, setStrength] = useState(0);
	const [breachCount, setBreachCount] = useState(0);

	const handleCheckPassword = async () => {
		try {
			console.log("Sending request with password:", password);
			const response = await fetch(
				"https://flask-backend-password-strength-checker.onrender.com",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ password }),
				}
			);

			console.log("Response status:", response.status);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log("Response data:", data);
			setStrength(data.strength);
			setBreachCount(data.breach_count);
		} catch (error) {
			console.error("Error checking password:", error);
		}
	};

	const getStrengthColor = () => {
		if (strength <= 2) return "red";
		if (strength === 3) return "orange";
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

			{breachCount > 0 && (
				<p className="breach-warning">
					⚠️ This password has been breached {breachCount} times. Do not use it!
				</p>
			)}
		</div>
	);
}

export default App;
