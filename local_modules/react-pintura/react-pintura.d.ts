declare module '@pqina/react-pintura' {
    import {
        PinturaEditorDefaultOptions,
        PinturaEditorModalOptions,
        PinturaDefaultImageReaderResult,
        PinturaDefaultImageWriterResult,
        PinturaReadState,
        PinturaWriteState,
        PinturaImageState,
        PinturaEditor as PinturaEditorInstance,
        PinturaEditorModal as PinturaEditorModalInstance,
        Shape,
    } from '@pqina/pintura';

    import * as React from 'react';

    interface PinturaComponentEvents {
        onInit?: (detail: PinturaEditorInstance) => void;
        onLoadstart?: () => void;
        onLoadabort?: (detail: PinturaReadState) => void;
        onLoaderror?: (detail: PinturaReadState) => void;
        onLoadprogress?: (detail: PinturaReadState) => void;
        onLoad?: (detail: PinturaDefaultImageReaderResult) => void;
        onProcessstart?: () => void;
        onProcessabort?: (detail: PinturaWriteState) => void;
        onProcesserror?: (detail: PinturaWriteState) => void;
        onProcessprogress?: (detail: PinturaWriteState) => void;
        onProcess?: (detail: PinturaDefaultImageWriterResult) => void;
        onLoadpreview?: (detail: ImageData | ImageBitmap) => void;
        onReady?: () => void;
        onUpdate?: (detail: PinturaImageState) => void;
        onUndo?: (detail: number) => void;
        onRedo?: (detail: number) => void;
        onRevert?: () => void;
        onClose?: () => void;
        onDestroy?: () => void;
        onAddshape?: (detail: Shape) => void;
        onSelectshape?: (detail: Shape) => void;
        onUpdateshape?: (detail: Shape) => void;
        onRemoveshape?: (detail: Shape) => void;
        onSelectstyle?: (detail: { [key: string]: unknown }) => void;
    }

    interface PinturaComponentModalEvents extends PinturaComponentEvents {
        onShow?: () => void;
        onHide?: () => void;
    }

    export class PinturaEditor extends React.Component<
        PinturaEditorDefaultOptions & PinturaComponentEvents & { className?: string },
        any
    > {
        editor: PinturaEditorInstance;
    }

    export class PinturaEditorModal extends React.Component<
        PinturaEditorDefaultOptions & PinturaEditorModalOptions & PinturaComponentModalEvents,
        { className?: string },
        any
    > {
        editor: PinturaEditorModalInstance;
    }

    export class PinturaEditorOverlay extends React.Component<
        PinturaEditorDefaultOptions & PinturaComponentEvents & { className?: string },
        any
    > {
        editor: PinturaEditorInstance;
    }
}
