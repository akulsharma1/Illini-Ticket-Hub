import { Account } from "@prisma/client";

export function isValidAccountFormat(account: Account): boolean {
    if (!account) {
        return false;
    }

    if (!account.email_address || !account.name || !account.password) {
        return false;
    }

    if (typeof account.email_address !== "string" || typeof account.name !== "string" || typeof account.password !== "string") {
        return false;
    }

    return true;
}

export function isValidSigninAccountFormat(account: Account): boolean {
    if (!account) {
        return false;
    }

    if (!account.email_address || !account.password) {
        return false;
    }

    if (typeof account.email_address !== "string" || typeof account.password !== "string") {
        return false;
    }

    return true;
}
