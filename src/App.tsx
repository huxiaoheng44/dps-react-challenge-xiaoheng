import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

function App() {
	const [locality, setLocality] = useState('');
	const [postalCode, setPostalCode] = useState('');

	const showPostalCodeSelect = locality.trim().toLowerCase() === 'test';
	const showError = postalCode.length >= 5 && !/^\d{5}$/.test(postalCode);

	return (
		<main className="flex min-h-screen w-full items-center justify-center bg-accent/20 px-4 py-10 font-bold">
			<section className="w-full max-w-5xl space-y-6 rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight text-foreground">
						German Address Validator
					</h1>
					<p className="mt-3 text-base text-foreground/80">
						Enter locality and PLZ to validate.
					</p>
				</div>

				<div className="space-y-3">
					<Label htmlFor="locality">Locality</Label>
					<Input
						id="locality"
						className="h-11 border-input bg-card text-base"
						value={locality}
						onChange={(event) => setLocality(event.target.value)}
					/>
				</div>

				<div className="space-y-3">
					<Label htmlFor="postal-code">Postal Code (PLZ)</Label>
					{showPostalCodeSelect ? (
						<Select
							value={postalCode}
							onValueChange={setPostalCode}
						>
							<SelectTrigger
								id="postal-code"
								className="h-11 w-full border-input bg-card text-base"
							>
								<SelectValue placeholder="Select PLZ" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="10115">10115</SelectItem>
								<SelectItem value="10117">10117</SelectItem>
								<SelectItem value="10119">10119</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<Input
							id="postal-code"
							className="h-11 border-input bg-card text-base"
							placeholder="e.g. 80331"
							value={postalCode}
							onChange={(event) =>
								setPostalCode(event.target.value)
							}
						/>
					)}
				</div>

				{showError ? (
					<Alert variant="destructive">
						<AlertTitle>Invalid PLZ</AlertTitle>
						<AlertDescription>
							Please enter exactly 5 digits.
						</AlertDescription>
					</Alert>
				) : null}

				<div className="mt-auto flex justify-center  ">
					<Button className="h-11 w-md px-6 text-base bg-gray-900 text-white font-bold">
						Validate
					</Button>
				</div>
			</section>
		</main>
	);
}

export default App;
