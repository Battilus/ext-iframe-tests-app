import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import './App.css';
import { Button, Card, Input, InputProps, Modal, Select, Switch, Typography } from 'antd';

const originSand = {
  s17: 'https://sandbox-17--www.extranet.travel',
  s18: 'https://sandbox-18--www.extranet.travel',
}

const sandboxOptions = [
  {
    value: originSand.s17,
    label: 's17',
  },
  {
    value: originSand.s18,
    label: 's18',
  },
]

function App() {
  const [isIframeOpen, setIsIframeOpen] = useState<boolean>(false);
  const [isShowLogs, setIsShowLogs] = useState<boolean>(false);
  const [currentSandbox, setCurrentSandbox] = useState<string>(originSand.s18);
  const [token, setToken] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [iframeHeight, setIframeHeight] = useState(0);

  useEffect(() => {
    const handleIframeMessage = (event: { origin: string; data: { type: string; height: React.SetStateAction<number>; }; }) => {

      if (isShowLogs) {
        console.log(event, window.location.origin, iframeRef);
      }

      if (event.data && event.data.type === 'iframeHeight') {
        setIframeHeight(event.data.height);
      }
    };

    window.addEventListener('message', handleIframeMessage);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [isShowLogs]);

  const handleIframeLoad = (event: SyntheticEvent<HTMLIFrameElement, Event>) => {
    if (isShowLogs) {
      console.log('handleIframeLoad', window.location.origin, event, iframeRef);
    }

    if (iframeRef.current) {
      iframeRef.current?.contentWindow?.postMessage({origin: window.location.origin}, currentSandbox)
    }
  };

  const getIframeSrc = () => {
    return `${currentSandbox}/ru/quick_connect${token ? `?token=${token}` : ''}`;
  }

  const openIframe = () => setIsIframeOpen(true);
  const closeIframe = () => {
    setIframeHeight(0);
    setIsIframeOpen(false);
  }

  const renderControls = () => {
    const changeToken: InputProps['onChange'] = (event) => {
      setToken(event.target.value);
    }

    return (
      <div className="controls">
        <div className="fieldWithLabel">
          <Typography.Text type="secondary">Current sandbox</Typography.Text>
          <Select
            placeholder="Choose sandbox"
            options={sandboxOptions}
            defaultValue={currentSandbox}
            onChange={setCurrentSandbox}
          />
        </div>

        <div className="fieldWithLabel">
          <Typography.Text type="secondary">Quick connect token (optional)</Typography.Text>
          <Input
            placeholder="Input token"
            value={token}
            onChange={changeToken}
          />
        </div>

        <Button type="primary" onClick={openIframe}>
          Open iframe
        </Button>
      </div>
    )
  }

  const renderIframeInModal = () => {
    return (
      <Modal
        title="Ext Iframe test"
        open={isIframeOpen}
        onCancel={closeIframe}
        centered={true}
        footer={null}
        width={612}
        destroyOnClose={true}
      >
        <iframe
          title="iFrame"
          ref={iframeRef}
          src={getIframeSrc()}
          onLoad={handleIframeLoad}
          width={560}
          style={{ height: iframeHeight, minHeight: 460 }}
        />
      </Modal>
    )
  }

  const renderLogsControl = () => {
    return (
      <div className="logsControlSwitch">
        Show logs <Switch value={isShowLogs} onChange={(value) => setIsShowLogs(value)} size="small"/>
      </div>
    )
  }

  return (
    <div className="App">
      <div className="wrapper">
        <div className="container">
          <Card title="Ext iframe tests" extra={renderLogsControl()}>
            {renderControls()}
            {renderIframeInModal()}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
