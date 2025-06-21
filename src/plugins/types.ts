export interface BottomBarPlugin {
	id: string;
	render: () => React.ReactNode;
	order?: number;
}
export interface EditorPanePlugin {
	contentType: string;
	render: (props: any) => React.ReactNode;
}
