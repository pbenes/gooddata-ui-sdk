// (C) 2019-2020 GoodData Corporation

import { ObjRef, ObjectType } from "../../objRef";
import isEmpty from "lodash/isEmpty";

/**
 * @public
 */
export interface IMetadataObject {
    /**
     * Type of metadata object
     */
    type: ObjectType;

    /**
     * Metadata object reference
     */
    ref: ObjRef;

    /**
     * Metadata object identifier
     * Currently, our implementation still depends on converting id to uri (or uri to id)
     * So until we add cache, keep both id and uri exposed on metadata objects
     */
    id: string;

    /**
     * Metadata object uri
     * Currently, our implementation still depends on converting id to uri (or uri to id)
     * So until we add cache, keep both id and uri exposed on metadata objects
     */
    uri: string;

    /**
     * Title
     */
    title: string;

    /**
     * Description
     */
    description: string;

    /**
     * Is production
     */
    production: boolean;

    /**
     * Is metadata object deprecated?
     * Deprecated metadata objects still work in created reports or insights,
     * but you cannot select them for new ones (they are not displayed in the lists).
     */
    deprecated: boolean;

    /**
     * Indicates whether the item is unlisted. Depending on the context, unlisted items may
     * not be shown to the users at all or may be shown with a special indicator.
     */
    unlisted: boolean;
}

export function isMetadataObject(obj: unknown): obj is IMetadataObject {
    const c = obj as IMetadataObject;

    return !isEmpty(c) && c.type !== undefined && c.ref !== undefined;
}
