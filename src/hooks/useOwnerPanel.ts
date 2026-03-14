import {useState} from 'react';

export type OwnerPanelTab = 'none' | 'department' | 'position' | 'myPositions' | 'createChat' | 'companySettings';

export function useOwnerPanel() {
    const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState(false);
    const [ownerPanelTab, setOwnerPanelTab] = useState<OwnerPanelTab>('none');

    const openOwnerPanel = () => {
        setIsOwnerPanelOpen(true);
        setOwnerPanelTab('none');
    };

    const closeOwnerPanel = () => {
        setIsOwnerPanelOpen(false);
        setOwnerPanelTab('none');
    };

    const toggleOwnerPanelSection = (section: Exclude<OwnerPanelTab, 'none'>) => {
        setOwnerPanelTab((prev) => (prev === section ? 'none' : section));
    };

    return {
        isOwnerPanelOpen,
        ownerPanelTab,
        openOwnerPanel,
        closeOwnerPanel,
        toggleOwnerPanelSection,
    };
}