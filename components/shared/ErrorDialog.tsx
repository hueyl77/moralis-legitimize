import React, { useState } from 'react';

import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";

interface Props {
  errorMsg: string;
  showErrorMsg: boolean;
  setShowErrorMsg: (val: boolean) => void;
}

const ErrorDialog: React.FC<Props> = ({ children, errorMsg, showErrorMsg, setShowErrorMsg }) => {
  return (
    <Dialog open={showErrorMsg} handler={setShowErrorMsg}>
      <DialogHeader>
          Please check your wallet
      </DialogHeader>
      <DialogBody>
        <div className="font-normal">
          {errorMsg}
        </div>
      </DialogBody>
      <DialogFooter>
          <Button
              color="red"
              onClick={(e) => setShowErrorMsg(false)}
          >
              Close
          </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ErrorDialog;