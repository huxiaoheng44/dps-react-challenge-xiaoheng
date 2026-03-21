import { useEffect, useState } from 'react';
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
import {
	lookupByLocality,
	lookupByPostalCode,
	validateLocalityAndPostalCode,
} from './lib/openplz';

function App() {
	const [locality, setLocality] = useState('');
	const [postalCode, setPostalCode] = useState('');
	const [postalCodeOptions, setPostalCodeOptions] = useState<string[]>([]);
	const [localityOptions, setLocalityOptions] = useState<string[]>([]);
	const [errorMsg, setErrorMsg] = useState('');
	const [validationMsg, setValidationMsg] = useState('');
	const [isValidPair, setIsValidPair] = useState<boolean | null>(null);
	const [isResultModalOpen, setIsResultModalOpen] = useState(false);

	const showPostalCodeSelect = postalCodeOptions.length > 1;
	const showLocalitySelect = localityOptions.length > 1;

	useEffect(() => {
		const trimmedLocality = locality.trim();
		const timeoutId = window.setTimeout(() => {
			if (!trimmedLocality) {
				setPostalCodeOptions([]);
				setPostalCode('');
				setLocalityOptions([]);
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

	const handleValidatePair = async () => {
		if (!locality.trim() || !/^\d{5}$/.test(postalCode.trim())) {
			setIsValidPair(false);
			setValidationMsg(
				'Please provide a locality and a valid 5-digit PLZ first.',
			);
			setIsResultModalOpen(true);
			return;
		}

		try {
			const isMatch = await validateLocalityAndPostalCode(
				locality,
				postalCode,
			);

			setIsValidPair(isMatch);
			setValidationMsg(
				isMatch
					? 'Locality and postal code match.'
					: 'Please check whether locality and postal code match.',
			);
			setIsResultModalOpen(true);
		} catch {
			setIsValidPair(false);
			setValidationMsg(
				'Validation request failed. Please check whether locality and postal code match.',
			);
			setIsResultModalOpen(true);
		}
	};

	useEffect(() => {
		const trimmedPostalCode = postalCode.trim();

		if (!trimmedPostalCode) {
			setErrorMsg('');
			setLocalityOptions([]);
			return;
		}

		if (!/^\d{5}$/.test(trimmedPostalCode)) {
			setErrorMsg(
				trimmedPostalCode.length > 5
					? 'Please enter a valid 5-digit PLZ.'
					: '',
			);
			setLocalityOptions([]);
			return;
		}

		setErrorMsg('');
		void (async () => {
			try {
				const localities = await lookupByPostalCode(trimmedPostalCode);
				if (localities.length === 1) {
					setLocalityOptions([]);
					setLocality(localities[0]);
				} else if (localities.length > 1) {
					setLocalityOptions(localities);
					setLocality(localities[0]);
				} else if (localities.length === 0) {
					setLocalityOptions([]);
					setErrorMsg('No locality found for this PLZ.');
				}
			} catch {
				setLocalityOptions([]);
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
					{showLocalitySelect ? (
						<Select value={locality} onValueChange={setLocality}>
							<SelectTrigger
								id="locality"
								className="h-11 w-full border-input bg-card text-base"
							>
								<SelectValue placeholder="Select locality" />
							</SelectTrigger>
							<SelectContent
								position="popper"
								className="z-100! max-h-40! overflow-y-auto bg-white text-black"
							>
								{localityOptions.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<Input
							id="locality"
							className="h-11 border-input bg-card text-base"
							value={locality}
							onChange={(event) => {
								setLocality(event.target.value);
								setLocalityOptions([]);
							}}
						/>
					)}
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

				{errorMsg ? (
					<Alert variant="destructive">
						<AlertTitle>Invalid PLZ</AlertTitle>
						<AlertDescription>{errorMsg}</AlertDescription>
					</Alert>
				) : null}

				<div className="mt-auto flex justify-center">
					<Button
						variant="outline"
						className="h-11 w-56 px-6 font-bold text-base"
						onClick={handleValidatePair}
					>
						Validate
					</Button>
				</div>
			</section>

			{isResultModalOpen ? (
				<div className="fixed inset-0 z-100! flex items-center justify-center p-4">
					<div className="w-full max-w-md rounded-xl border border-border bg-white p-6 text-card-foreground shadow-lg">
						<h2 className="text-xl font-semibold">
							{isValidPair ? (
								<a className="text-green-500">Valid Match</a>
							) : (
								<a className="text-red-500">Invalid Match</a>
							)}
						</h2>
						<p className="mt-2 text-base">{validationMsg}</p>
						<div className="mt-5 flex justify-end">
							<Button
								className="bg-red-600 text-white hover:bg-red-700"
								variant="destructive"
								onClick={() => setIsResultModalOpen(false)}
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</main>
	);
}

export default App;
