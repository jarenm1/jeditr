import React from "react";
import { useBottomBarStore } from "@ubar/ubarStore";

export const BottomBar: React.FC = () => {
	const items = useBottomBarStore((state) => state.items);

	return (
		<div className="fixed bottom-0 left-0 right-0 h-8 bg-[var(--color-bg)] text-white flex items-center px-4 font-mono z-50 border-t border-[var(--color-tertiary)]">
			{items.map((item) => (
				<div key={item.id} className="mr-6 flex items-center">
					<item.component />
				</div>
			))}
		</div>
	);
};
