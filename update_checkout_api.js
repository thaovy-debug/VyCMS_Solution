const fs = require('fs');
const path = require('path');

const checkoutPath = path.join(__dirname, 'cms.frontend/src/pages/Checkout.jsx');
let contentCheck = fs.readFileSync(checkoutPath, 'utf8');

const oldCheckApiCall = `        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://provinces.open-api.vn/api/?depth=3');
                setProvinces(res.data);
            } catch (err) {
                console.error("Failed to load provinces", err);
            }
        };
        fetchProvinces();
    }, [location.state]);

    useEffect(() => {
        if (selectedProvince) {
            const p = provinces.find(p => p.name === selectedProvince);
            setDistricts(p ? p.districts : []);
            setWards([]);
            setSelectedDistrict('');
            setSelectedWard('');
        }
    }, [selectedProvince, provinces]);

    useEffect(() => {
        if (selectedDistrict && useAddressBook === false) {
            const d = districts.find(d => d.name === selectedDistrict);
            setWards(d ? d.wards : []);
            setSelectedWard('');
        }
    }, [selectedDistrict, districts, useAddressBook]);`;

const newCheckApiCall = `        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://provinces.open-api.vn/api/v2/?depth=2');
                setProvinces(res.data);
            } catch (err) {
                console.error("Failed to load provinces", err);
            }
        };
        fetchProvinces();
    }, [location.state]);

    useEffect(() => {
        if (selectedProvince) {
            const p = provinces.find(p => p.name === selectedProvince);
            setWards(p ? p.wards : []);
            setSelectedWard('');
        }
    }, [selectedProvince, provinces]);`;

contentCheck = contentCheck.replace(oldCheckApiCall, newCheckApiCall);

// Remove district select
const oldCheckDistrictSelect = `                                        <div className="col-md-4 mb-3">
                                            <select 
                                                className="form-control" 
                                                style={{ borderRadius: '8px' }}
                                                value={selectedDistrict}
                                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                            >
                                                <option value="">Quận/Huyện</option>
                                                {districts.map(d => (
                                                    <option key={d.code} value={d.name}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">`;
const newCheckDistrictSelect = `                                        <div className="col-md-6 mb-3">`;
contentCheck = contentCheck.replace(oldCheckDistrictSelect, newCheckDistrictSelect);

contentCheck = contentCheck.replace(/<div className="col-md-4 mb-3">\s*<select\s*className="form-control"\s*style=\{\{ borderRadius: '8px' \}\}\s*value=\{selectedProvince\}/, '<div className="col-md-6 mb-3">\n                                            <select \n                                                className="form-control" \n                                                style={{ borderRadius: \'8px\' }}\n                                                value={selectedProvince}');
contentCheck = contentCheck.replace(/<div className="col-md-4 mb-3">\s*<select\s*className="form-control"\s*style=\{\{ borderRadius: '8px' \}\}\s*value=\{selectedWard\}/, '<div className="col-md-6 mb-3">\n                                            <select \n                                                className="form-control" \n                                                style={{ borderRadius: \'8px\' }}\n                                                value={selectedWard}');

const handleSelectAddressOld = `    const handleSelectAddress = (id) => {
        setSelectedAddressId(id);
        const addr = addressBook.find(a => a.id === id);
        if (addr) {
            setSelectedProvince(addr.province);
            // Cập nhật districts và wards tạm thời hoặc bỏ qua logic reset của useEffect
            const p = provinces.find(prov => prov.name === addr.province);
            if (p) {
                setDistricts(p.districts);
                const d = p.districts.find(dist => dist.name === addr.district);
                if (d) setWards(d.wards);
            }
            setSelectedDistrict(addr.district);
            setSelectedWard(addr.ward);
            setSpecificAddress(addr.specific);
        }
    };`;

const handleSelectAddressNew = `    const handleSelectAddress = (id) => {
        setSelectedAddressId(id);
        const addr = addressBook.find(a => a.id === id);
        if (addr) {
            setSelectedProvince(addr.province);
            const p = provinces.find(prov => prov.name === addr.province);
            if (p) {
                setWards(p.wards);
            }
            setSelectedWard(addr.ward);
            setSpecificAddress(addr.specific);
        }
    };`;

contentCheck = contentCheck.replace(handleSelectAddressOld, handleSelectAddressNew);

fs.writeFileSync(checkoutPath, contentCheck, 'utf8');
console.log("Updated Checkout API");
