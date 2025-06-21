import React, { useEffect, useState } from "react";
import { PickerModal, PickerItem } from "./PickerModal";
import { invoke } from "@tauri-apps/api/core";

export interface FileSelectorProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (file: PickerItem) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
	isOpen,
	onClose,
	onSelect,
}) => {
	const [files, setFiles] = useState<PickerItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			setLoading(true);
			setError(null);
			// Try git-aware first, then fallback
			invoke<{ name: string; path: string }[]>("list_git_files")
				.then((fileList) => {
					setFiles(
						fileList
							.slice(0, 100)
							.map((f) => ({ label: f.name, value: f.path })),
					);
					setLoading(false);
				})
				.catch(() => {
					// Fallback to recursive scan
					invoke<{ name: string; path: string }[]>("list_files")
						.then((fileList) => {
							setFiles(
								fileList
									.slice(0, 100)
									.map((f) => ({ label: f.name, value: f.path })),
							);
							setLoading(false);
						})
						.catch((err) => {
							setError(typeof err === "string" ? err : "Failed to load files");
							setLoading(false);
						});
				});
		} else {
			setFiles([]);
			setError(null);
		}
	}, [isOpen]);

	return (
		<PickerModal
			isOpen={isOpen}
			onClose={onClose}
			items={files}
			onSelect={onSelect}
			title={
				loading
					? "Loading files..."
					: error
						? `Error: ${error}`
						: "Select a file"
			}
		/>
	);
};
