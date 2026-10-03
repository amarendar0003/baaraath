"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
} from "lucide-react";

type LocationData = {
  state: string;
  districts: Record<string, string[]>;
};

const LOCATION_DATA: LocationData[] = [
  {
    state: "Telangana",
    districts: {
      Hyderabad: ["Hyderabad"],
      Warangal: ["Warangal", "Hanamkonda"],
      Hanamkonda: ["Hanamkonda", "Kazipet"],
      Mahabubabad: ["Mahabubabad", "Thorrur"],
      Khammam: ["Khammam"],
      Karimnagar: ["Karimnagar"],
      Nalgonda: ["Nalgonda"],
      Adilabad: ["Adilabad"],
      Nizamabad: ["Nizamabad"],
      Siddipet: ["Siddipet"],
      Suryapet: ["Suryapet"],
      Medak: ["Medak"],
      Rangareddy: ["Hyderabad", "Shamshabad"],
      "Bhadradri Kothagudem": ["Kothagudem"],
    },
  },
  {
    state: "Andhra Pradesh",
    districts: {
      Vijayawada: ["Vijayawada"],
      Visakhapatnam: ["Visakhapatnam"],
      Guntur: ["Guntur"],
      Tirupati: ["Tirupati"],
      Nellore: ["Nellore"],
      Kurnool: ["Kurnool"],
      Rajahmundry: ["Rajahmundry"],
      Kakinada: ["Kakinada"],
    },
  },
  {
    state: "Karnataka",
    districts: {
      Bengaluru: ["Bengaluru"],
      Mysuru: ["Mysuru"],
      Mangaluru: ["Mangaluru"],
      Hubballi: ["Hubballi"],
      Belagavi: ["Belagavi"],
    },
  },
  {
    state: "Tamil Nadu",
    districts: {
      Chennai: ["Chennai"],
      Coimbatore: ["Coimbatore"],
      Madurai: ["Madurai"],
      Salem: ["Salem"],
      Tiruchirappalli: ["Tiruchirappalli"],
    },
  },
  {
    state: "Maharashtra",
    districts: {
      Mumbai: ["Mumbai"],
      Pune: ["Pune"],
      Nagpur: ["Nagpur"],
      Nashik: ["Nashik"],
    },
  },
];

const POPULAR_LOCATIONS = [
  {
    city: "Hyderabad",
    state: "Telangana",
  },
  {
    city: "Warangal",
    state: "Telangana",
  },
  {
    city: "Vijayawada",
    state: "Andhra Pradesh",
  },
  {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
  },
];

export default function LocationsPage() {
  const router = useRouter();

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");

  const [locationName, setLocationName] = useState("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "detecting" | "success" | "error"
  >("idle");
  const [locationMessage, setLocationMessage] = useState("");

  const selectedState = useMemo(
    () => LOCATION_DATA.find((item) => item.state === state),
    [state],
  );

  const districts = useMemo(
    () => (selectedState ? Object.keys(selectedState.districts) : []),
    [selectedState],
  );

  const cities = useMemo(() => {
    if (!selectedState || !district) {
      return [];
    }

    return selectedState.districts[district] || [];
  }, [selectedState, district]);

  useEffect(() => {
    const saved = window.localStorage.getItem("baaraath_location");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (parsed?.city) {
          setCity(parsed.city);
          setState(parsed.state || "");
          setDistrict(parsed.district || "");
          setLocationName(parsed.city);
          setLocationStatus("success");
          setLocationMessage("Previously selected location");
        }
      } catch {
        // Ignore invalid saved location.
      }
    }
  }, []);

  function saveLocation(
    selectedCity: string,
    selectedState: string,
    selectedDistrict = "",
  ) {
    const location = {
      city: selectedCity,
      state: selectedState,
      district: selectedDistrict,
    };

    window.localStorage.setItem(
      "baaraath_location",
      JSON.stringify(location),
    );

    window.dispatchEvent(
      new CustomEvent("baaraath-location-changed", {
        detail: location,
      }),
    );
  }

  function handleStateChange(value: string) {
    setState(value);
    setDistrict("");
    setCity("");
    setLocationName("");
    setLocationStatus("idle");
    setLocationMessage("");
  }

  function handleDistrictChange(value: string) {
    setDistrict(value);
    setCity("");
    setLocationName("");
    setLocationStatus("idle");
    setLocationMessage("");
  }

  function handleCityChange(value: string) {
    setCity(value);

    if (value) {
      saveLocation(value, state, district);
      setLocationName(value);
      setLocationStatus("success");
      setLocationMessage("Location selected manually");
    }
  }

  function findServices() {
    if (!city) {
      setLocationStatus("error");
      setLocationMessage("Please select a city first.");
      return;
    }

    saveLocation(city, state, district);

    router.push(`/services?city=${encodeURIComponent(city)}`);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationMessage(
        "Location detection is not supported by this browser.",
      );
      return;
    }

    setLocationStatus("detecting");
    setLocationMessage("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Unable to determine your location.");
          }

          const data = await response.json();

          const address = data.address || {};

          const detectedCity =
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            address.county ||
            "";

          const detectedState = address.state || "";

          if (!detectedCity) {
            throw new Error(
              "Your location was detected, but the city could not be identified.",
            );
          }

          setLocationName(detectedCity);
          setLocationStatus("success");
          setLocationMessage("Automatically detected");

          const matchingState = LOCATION_DATA.find(
            (item) =>
              item.state.toLowerCase() === detectedState.toLowerCase(),
          );

          if (matchingState) {
            setState(matchingState.state);

            const matchingDistrict = Object.entries(
              matchingState.districts,
            ).find(([, cityList]) =>
              cityList.some(
                (item) =>
                  item.toLowerCase() === detectedCity.toLowerCase(),
              ),
            );

            if (matchingDistrict) {
              setDistrict(matchingDistrict[0]);
              setCity(
                matchingDistrict[1].find(
                  (item) =>
                    item.toLowerCase() === detectedCity.toLowerCase(),
                ) || detectedCity,
              );
            } else {
              setCity(detectedCity);
            }
          } else {
            setCity(detectedCity);
          }

          saveLocation(
            detectedCity,
            matchingState?.state || detectedState,
            "",
          );
        } catch (error) {
          console.error(error);

          setLocationStatus("error");
          setLocationMessage(
            error instanceof Error
              ? error.message
              : "Unable to determine your location.",
          );
        }
      },
      (error) => {
        console.error(error);

        let message =
          "Location permission was denied. Please allow location access.";

        if (error.code === 2) {
          message =
            "Your current location could not be determined. Please select your city manually.";
        }

        if (error.code === 3) {
          message =
            "Location detection timed out. Please select your city manually.";
        }

        setLocationStatus("error");
        setLocationMessage(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  }

  const statusClass =
    locationStatus === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : locationStatus === "error"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              <MapPin className="h-4 w-4" />
              Baaraath Locations
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Find services near you
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Choose your location manually or allow Baaraath to detect
              your current location automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Current location
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {locationName || "Location not selected"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {locationMessage ||
                      "Use automatic detection or choose a location manually."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locationStatus === "detecting"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LocateFixed
                    className={`h-4 w-4 ${
                      locationStatus === "detecting"
                        ? "animate-pulse"
                        : ""
                    }`}
                  />
                  {locationStatus === "detecting"
                    ? "Detecting..."
                    : "Use My Current Location"}
                </button>
              </div>

              {locationStatus !== "idle" && (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${statusClass}`}
                >
                  <div className="flex items-start gap-3">
                    {locationStatus === "success" ? (
                      <Check className="mt-0.5 h-5 w-5 shrink-0" />
                    ) : (
                      <Navigation className="mt-0.5 h-5 w-5 shrink-0" />
                    )}

                    <span>{locationMessage}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                  Manual selection
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Select your location
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Select State, District and City.
                </p>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-3">
                <SelectBox
                  label="State"
                  value={state}
                  options={LOCATION_DATA.map((item) => item.state)}
                  placeholder="Select State"
                  onChange={handleStateChange}
                />

                <SelectBox
                  label="District"
                  value={district}
                  options={districts}
                  placeholder={
                    state ? "Select District" : "Select State first"
                  }
                  disabled={!state}
                  onChange={handleDistrictChange}
                />

                <SelectBox
                  label="City"
                  value={city}
                  options={cities}
                  placeholder={
                    district ? "Select City" : "Select District first"
                  }
                  disabled={!district}
                  onChange={handleCityChange}
                />
              </div>

              <button
                type="button"
                onClick={findServices}
                disabled={!city}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Search className="h-4 w-4" />
                Find Services in {city || "Selected City"}
              </button>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Popular
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Popular locations
            </h2>

            <div className="mt-5 space-y-3">
              {POPULAR_LOCATIONS.map((item) => (
                <button
                  key={`${item.city}-${item.state}`}
                  type="button"
                  onClick={() => {
                    setState(item.state);

                    const stateData = LOCATION_DATA.find(
                      (location) => location.state === item.state,
                    );

                    const matchingDistrict = stateData
                      ? Object.entries(stateData.districts).find(
                          ([, cities]) =>
                            cities.some(
                              (cityName) =>
                                cityName.toLowerCase() ===
                                item.city.toLowerCase(),
                            ),
                        )
                      : undefined;

                    setDistrict(matchingDistrict?.[0] || "");
                    setCity(item.city);
                    setLocationName(item.city);
                    setLocationStatus("success");
                    setLocationMessage("Location selected manually");

                    saveLocation(
                      item.city,
                      item.state,
                      matchingDistrict?.[0] || "",
                    );
                  }}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <MapPin className="h-5 w-5" />
                    </span>

                    <span>
                      <span className="block font-semibold text-slate-900">
                        {item.city}
                      </span>

                      <span className="block text-xs text-slate-500">
                        {item.state}
                      </span>
                    </span>
                  </span>

                  <ChevronDown className="h-4 w-4 -rotate-90 text-slate-400 transition group-hover:text-amber-500" />
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SelectBox({
  label,
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}
