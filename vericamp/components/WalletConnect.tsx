"use client";

import { useEffect, useState } from "react";
import { PeraWalletConnect } from "@perawallet/connect";
import { formatAddress } from "@/lib/algorand";
import { Wallet } from "lucide-react";

let peraWallet: PeraWalletConnect | null = null;

export default function WalletConnect({ onConnect }: { onConnect: (address: string) => void }) {
    const [accountAddress, setAccountAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize PeraWalletConnect only on the client
        if (!peraWallet) {
            peraWallet = new PeraWalletConnect();
        }

        // Reconnect to the session when the component mounts
        peraWallet.reconnectSession().then((accounts) => {
            // Setup the disconnect event listener
            peraWallet?.connector?.on("disconnect", handleDisconnectWalletClick);

            if (accounts.length) {
                setAccountAddress(accounts[0]);
                setIsConnected(true);
                onConnect(accounts[0]);
            }
        });

        return () => {
            // cleanup
            peraWallet?.connector?.off("disconnect", handleDisconnectWalletClick);
        }
    }, []);

    const handleConnectWalletClick = () => {
        if (!peraWallet) return;
        peraWallet
            .connect()
            .then((newAccounts) => {
                peraWallet?.connector?.on("disconnect", handleDisconnectWalletClick);
                setAccountAddress(newAccounts[0]);
                setIsConnected(true);
                onConnect(newAccounts[0]);
            })
            .catch((error) => {
                if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
                    console.error(error);
                }
            });
    };

    const handleDisconnectWalletClick = () => {
        if (!peraWallet) return;
        peraWallet.disconnect();
        setAccountAddress(null);
        setIsConnected(false);
        onConnect("");
    };

    return (
        <button
            onClick={isConnected ? handleDisconnectWalletClick : handleConnectWalletClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
        >
            <Wallet className="w-4 h-4" />
            {isConnected ? formatAddress(accountAddress!) : "Connect Pera Wallet"}
        </button>
    );
}
