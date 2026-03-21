import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { lookupByLocality, lookupByPostalCode } from './lib/openplz';

function App() {
	const [locality, setLocality] = useState('');
	const [postalCode, setPostalCode] = useState('');
	const [postalCodeOptions, setPostalCodeOptions] = useState<string[]>([]);
	const [ErrorMsg, setErrorMsg] = useState('');

	const showPostalCodeSelect = postalCodeOptions.length > 0;

	useEffect(() => {
		const trimmedLocality = locality.trim();
		const timeoutId = window.setTimeout(() => {
			if (!trimmedLocality) {
				setPostalCodeOptions([]);
				setPostalCode('');
				return;
			}

			void (async () => {
				try {
					const codes = await lookupByLocality(trimmedLocality);
					setPostalCodeOptions(codes);

					if (codes.length === 1) {
						setPostalCode(codes[0]);
					}
				} catch {
					setPostalCodeOptions([]);
				}
			})();
		}, 1000);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [locality]);

	useEffect(() => {
		const trimmedPostalCode = postalCode.trim();

		if (!trimmedPostalCode) {
			setErrorMsg('');
			return;
		}

		if (!/^\d{5}$/.test(trimmedPostalCode)) {
			setErrorMsg(
				trimmedPostalCode.length > 5
					? 'Please enter a valid 5-digit PLZ.'
					: '',
			);
			return;
		}

		setErrorMsg('');
		void (async () => {
			try {
				const localities = await lookupByPostalCode(trimmedPostalCode);
				if (localities.length >= 1) {
					setLocality(localities[0]);
				} else if (localities.length === 0) {
					setErrorMsg('No locality found for this PLZ.');
				}
			} catch {
				setErrorMsg('Failed to fetch localities for the provided PLZ.');
			}
		})();
	}, [postalCode]);

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
							<SelectContent
								position="popper"
								className="z-100! max-h-40! overflow-y-auto bg-white text-black"
							>
								{postalCodeOptions.map((code) => (
									<SelectItem key={code} value={code}>
										{code}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<Input
							id="postal-code"
							className="h-11 border-input bg-card text-base"
							inputMode="numeric"
							maxLength={5}
							value={postalCode}
							onChange={(event) => {
								const digitsOnly = event.target.value
									.replace(/\D/g, '')
									.slice(0, 5);
								setPostalCode(digitsOnly);
							}}
						/>
					)}
				</div>

				{ErrorMsg ? (
					<Alert variant="destructive">
						<AlertTitle>Invalid PLZ</AlertTitle>
						<AlertDescription>{ErrorMsg}</AlertDescription>
					</Alert>
				) : null}

				{/* <div className="mt-auto flex justify-center  ">
					<Button className="h-11 w-md px-6 text-base bg-gray-900 text-white font-bold">
						Validate
					</Button>
				</div> */}
			</section>
		</main>
	);
}

export default App;
