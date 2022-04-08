import React, { useEffect, useState } from 'react';
import Modal from "react-modal";
import { IToken } from '../../../../data/chains-data/interfaces';
import './tokens-modal.css';

const modalStyles: any = {
    content: {
        width: "320px",
        borderRadius: "32px",
        transform: "translateX(-50%)",
        left: "50%",
        maxHeight: "80vh",
        padding: "24px",
        boxShadow: " 0 6px 4px 0 rgba(0, 0, 0, 0.19)",
        overflow: "hidden"
    },
};

interface TokensModalProps {
    tokens: IToken[];
    selectedToken?: IToken;
    setSelectedToken: (token: IToken) => void;
}

export const TokensModal = ({ tokens, selectedToken, setSelectedToken }: TokensModalProps) => {
    const [displayedTokens, setDisplayedTokens] = useState<IToken[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        setDisplayedTokens(tokens);
    }, [tokens]);

    const closeModal = () => {
        setDisplayedTokens(tokens);
        setModalIsOpen(false);
    };

    const filterDisplayedTokens = (value: string) => {
        if (value === "" || !value) {
            setDisplayedTokens(tokens);
            return;
        }
        value = value.toLowerCase();
        const filteredTokens = tokens.filter(t => t.name?.toLowerCase().includes(value) || t.symbol?.toLowerCase().includes(value));
        setDisplayedTokens(filteredTokens);
    };

    return (
        <>
            <div className={`token-address ${tokens?.length === 0 ? 'script-block__field--error' : ''}`}
                onClick={() => { if (tokens?.length > 0) setModalIsOpen(true); }}>
                {tokens?.length > 0 ?
                    <>
                        <img className='token-img' src={selectedToken?.logoURI} alt={`${selectedToken?.symbol} logo`} />
                        <div>{selectedToken?.symbol}</div>
                    </> :
                    <>
                        <div className='missing-img'></div>
                    </>
                }
                <i className="arrow-down"></i>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={modalStyles}
                ariaHideApp={false}
            >
                <div className='tokens-modal'>
                    <div className='tokens-modal_search'>
                        <input
                            autoFocus
                            onChange={(e) => { filterDisplayedTokens(e.target.value); }} />
                    </div>
                    <div className='tokens-modal_list'>
                        {
                            displayedTokens.map((token, i) => (
                                <div key={i} className='tokens-modal_item' onClick={(e) => {
                                    setSelectedToken(token);
                                    closeModal();
                                }}>
                                    <img className='token-img' src={token.logoURI} />
                                    <div>
                                        <div>{token.symbol}</div>
                                        <div>{token.name}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </Modal></>
    );
};
