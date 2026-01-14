export default function DonationButton() {

    const link = "https://buymeacoffee.com/singbyhearts";

    return (
        <div className="flex justify-center my-6">
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105 active:scale-95"
            >
                <img
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                    alt="Buy Me A Coffee"
                    style={{ height: '50px', width: '217px' }}
                />
            </a>
        </div>
    );
}