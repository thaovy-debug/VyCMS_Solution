import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const VariantModal = ({ show, onClose, item, onConfirm, initialColor = '', initialSize = '', title = 'Thay đổi phân loại' }) => {
    const [editColor, setEditColor] = useState(initialColor);
    const [editSize, setEditSize] = useState(initialSize);

    useEffect(() => {
        if (show) {
            setEditColor(initialColor);
            setEditSize(initialSize);
        }
    }, [show, initialColor, initialSize]);

    if (!show || !item) return null;

    const handleConfirm = () => {
        let parsedColors = [];
        try { if (item.colors) parsedColors = JSON.parse(item.colors); } catch(e){}
        if (parsedColors.length > 0 && !editColor) {
            toast.warning('Vui lòng chọn màu sắc!');
            return;
        }
        if (item.sizes && !editSize) {
            toast.warning('Vui lòng chọn size!');
            return;
        }
        onConfirm(editColor, editSize);
    };

    let parsedColors = [];
    try { if (item.colors) parsedColors = JSON.parse(item.colors); } catch(e){}

    const sizes = item.sizes ? item.sizes.split(',').map(s => s.trim()).filter(s => s) : [];

    let editMaxStock = item.stockQuantity || 0;
    
    const needsColor = parsedColors.length > 0;
    const needsSize = sizes.length > 0;
    
    // Check if the user has selected everything that is required
    const isFullySelected = (!needsColor || editColor) && (!needsSize || editSize);

    if (item.variantStocks && isFullySelected) {
        try {
            const stocks = JSON.parse(item.variantStocks);
            const key = `${editColor || ''}-${editSize || ''}`;
            if (stocks[key] !== undefined) editMaxStock = stocks[key];
            else if (Object.keys(stocks).length > 0) editMaxStock = 0;
        } catch(e){}
    }

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onClose}></div>
            <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title font-weight-bold">{title}</h5>
                            <button type="button" className="close" onClick={onClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex mb-4">
                                <img src={item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl.split(',')[0] : `${import.meta.env.VITE_API_URL}${item.imageUrl.split(',')[0]}`) : ''} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
                                <div className="ml-3">
                                    <p className="font-weight-bold mb-1 text-dark" style={{ fontSize: '1rem', lineHeight: '1.2' }}>{item.name}</p>
                                    <p className="text-danger font-weight-bold mb-0" style={{ fontSize: '1.2rem' }}>
                                        {(val => new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ')(item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price)}
                                    </p>
                                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.85rem' }}>Kho còn: <span className="font-weight-bold">{editMaxStock}</span> sản phẩm</p>
                                </div>
                            </div>

                            {(() => {
                                let stocks = {};
                                if (item.variantStocks) {
                                    try { stocks = JSON.parse(item.variantStocks); } catch(e){}
                                }
                                const isColorDisabled = (colorName) => {
                                    if (!editSize || Object.keys(stocks).length === 0) return false;
                                    const key = `${colorName}-${editSize}`;
                                    return stocks[key] === undefined || stocks[key] <= 0;
                                };
                                const isSizeDisabled = (sizeName) => {
                                    if (!editColor || Object.keys(stocks).length === 0) return false;
                                    const key = `${editColor}-${sizeName}`;
                                    return stocks[key] === undefined || stocks[key] <= 0;
                                };

                                return (
                                    <>
                                        {parsedColors.length > 0 && (
                                            <div className="mb-3">
                                                <p className="font-weight-bold mb-2">Màu sắc</p>
                                                <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                                    {parsedColors.map(c => {
                                                        const disabled = isColorDisabled(c.name);
                                                        return (
                                                            <button 
                                                                key={c.name}
                                                                onClick={() => setEditColor(c.name)}
                                                                disabled={disabled}
                                                                className="btn btn-sm position-relative overflow-hidden"
                                                                style={{
                                                                    border: editColor === c.name ? '1px solid var(--zeychic-primary)' : '1px solid #e0e0e0',
                                                                    color: editColor === c.name ? 'var(--zeychic-primary)' : (disabled ? '#aaa' : '#333'),
                                                                    backgroundColor: editColor === c.name ? '#fff2f2' : (disabled ? '#f1f1f1' : '#f9f9f9'),
                                                                    fontWeight: editColor === c.name ? 'bold' : 'normal',
                                                                    borderRadius: '4px',
                                                                    opacity: disabled ? 0.6 : 1,
                                                                    cursor: disabled ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                {c.name}
                                                                {disabled && <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#aaa', transform: 'rotate(-15deg)'}}></div>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {sizes.length > 0 && (
                                            <div className="mb-3 mt-3">
                                                <p className="font-weight-bold mb-2">Size</p>
                                                <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
                                                    {sizes.map(s => {
                                                        const disabled = isSizeDisabled(s);
                                                        return (
                                                            <button 
                                                                key={s}
                                                                onClick={() => setEditSize(s)}
                                                                disabled={disabled}
                                                                className="btn btn-sm position-relative overflow-hidden"
                                                                style={{
                                                                    border: editSize === s ? '1px solid var(--zeychic-primary)' : '1px solid #e0e0e0',
                                                                    color: editSize === s ? 'var(--zeychic-primary)' : (disabled ? '#aaa' : '#333'),
                                                                    backgroundColor: editSize === s ? '#fff2f2' : (disabled ? '#f1f1f1' : '#f9f9f9'),
                                                                    fontWeight: editSize === s ? 'bold' : 'normal',
                                                                    borderRadius: '4px',
                                                                    minWidth: '40px',
                                                                    opacity: disabled ? 0.6 : 1,
                                                                    cursor: disabled ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                {s}
                                                                {disabled && <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#aaa', transform: 'rotate(-20deg)'}}></div>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button 
                                className="btn btn-block font-weight-bold" 
                                style={{ 
                                    backgroundColor: (editMaxStock <= 0 || (needsColor && !editColor) || (needsSize && !editSize)) ? '#cccccc' : 'var(--zeychic-primary)', 
                                    color: (editMaxStock <= 0 || (needsColor && !editColor) || (needsSize && !editSize)) ? '#666666' : '#ffffff',
                                    borderRadius: '8px', 
                                    padding: '10px 0',
                                    cursor: (editMaxStock <= 0 || (needsColor && !editColor) || (needsSize && !editSize)) ? 'not-allowed' : 'pointer'
                                }} 
                                disabled={editMaxStock <= 0 || (needsColor && !editColor) || (needsSize && !editSize)}
                                onClick={handleConfirm}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VariantModal;
