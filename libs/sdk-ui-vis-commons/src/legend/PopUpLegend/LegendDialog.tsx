// (C) 2007-2021 GoodData Corporation
import React from "react";
import { Overlay, useMediaQuery } from "@gooddata/sdk-ui-kit";
import { legendDialogAlignPoints, legendMobileDialogAlignPoints } from "./alignPoints";

const LegendDialogWrapper: React.FC<{ children: (isMobile: boolean) => JSX.Element }> = ({ children }) => {
    const isMobile = useMediaQuery("mobileDevice");
    return children(isMobile);
};

export interface ILegendDialogProps {
    isOpen: boolean;
    onCloseDialog: () => void;
    children?: React.ReactNode;
}

export const LegendDialog: React.FC<ILegendDialogProps> = (props: ILegendDialogProps) => {
    const { children, isOpen, onCloseDialog } = props;

    if (!isOpen) {
        return null;
    }

    return (
        <LegendDialogWrapper>
            {(isMobile) => {
                return (
                    <Overlay
                        alignTo={".s-legend-anchor"}
                        alignPoints={isMobile ? legendMobileDialogAlignPoints : legendDialogAlignPoints}
                        closeOnOutsideClick={!isMobile}
                        onClose={onCloseDialog}
                        className="kpi-alert-dialog-overlay"
                    >
                        {children}
                    </Overlay>
                );
            }}
        </LegendDialogWrapper>
    );
};
