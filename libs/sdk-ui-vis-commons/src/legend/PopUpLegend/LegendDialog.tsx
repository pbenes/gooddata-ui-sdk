// (C) 2007-2021 GoodData Corporation
import React from "react";
import { Overlay, useMediaQuery } from "@gooddata/sdk-ui-kit";
import { legendDialogAlignPoints, legendMobileDialogAlignPoints } from "./alignPoints";

const LegendDialogWrapper: React.FC<{ children: (isMobile: boolean) => JSX.Element }> = ({ children }) => {
    const isMobile = useMediaQuery("mobileDevice");
    return children(isMobile);
};

interface ILegendDialogContent {
    name: string;
    onCloseDialog: () => void;
}

const LegendDialogContent: React.FC<ILegendDialogContent> = (props) => {
    const { name, onCloseDialog, children } = props;

    return (
        <div className="legend-popup-dialog kpi-alert-dialog">
            <div className="legend-header">
                <div className="legend-header-title">{name}</div>
                <div className="legend-close action-close icon-cross" onClick={onCloseDialog} />
            </div>
            <div className="legend-content">{children}</div>
        </div>
    );
};

export interface ILegendDialogProps {
    name: string;
    isOpen: boolean;
    alignTo: string;
    onCloseDialog: () => void;
}

export const LegendDialog: React.FC<ILegendDialogProps> = (props) => {
    const { name, children, isOpen, alignTo, onCloseDialog } = props;

    if (!isOpen) {
        return null;
    }
    const alignToSelector = `.${alignTo}`;

    return (
        <LegendDialogWrapper>
            {(isMobile) => {
                return (
                    <Overlay
                        alignTo={alignToSelector}
                        alignPoints={isMobile ? legendMobileDialogAlignPoints : legendDialogAlignPoints}
                        closeOnOutsideClick={!isMobile}
                        onClose={onCloseDialog}
                        className="kpi-alert-dialog-overlay"
                    >
                        <LegendDialogContent name={name} onCloseDialog={onCloseDialog}>
                            {children}
                        </LegendDialogContent>
                    </Overlay>
                );
            }}
        </LegendDialogWrapper>
    );
};
