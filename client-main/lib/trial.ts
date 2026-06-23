import { TrialStatus } from "@/types/user";

export function formatTrialRemaining(remainingMs: number): string {
    if (remainingMs <= 0) return "0m";

    const totalMinutes = Math.floor(remainingMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}

export function getTrialHeadline(trial?: TrialStatus): string {
    if (!trial) return "5-hour free trial — full access to all features";

    if (trial.active) {
        return `Trial active — ${formatTrialRemaining(trial.remainingMs)} left`;
    }

    if (trial.used) {
        return "Free trial used — upgrade to keep full access";
    }

    return "5-hour free trial — full access to all features";
}
