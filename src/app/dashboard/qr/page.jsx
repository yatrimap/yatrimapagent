"use client";

import { useState, useRef, useEffect } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Copy, 
  Check, 
  QrCode,
  Smartphone,
  Printer,
  Hotel,
  Car,
  Target,
  Settings,
  Search,
  X,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export default function QRCodePage() {
  const { agent: agentData } = useAgent();
  const agent = agentData?.agent || {};
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  // QR Config state
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayMode, setDisplayMode] = useState("all");
  const [selectedServices, setSelectedServices] = useState(["HOTEL", "RENTAL", "ACTIVITY"]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsLoading, setItemsLoading] = useState(false);
  const [filterServiceType, setFilterServiceType] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const yatrimapUrl = 'https://yatrimap.com';
  const referralLink = `${yatrimapUrl}/ref/${agent?.agentId || ''}`;

  useEffect(() => {
    if (agent?.agentId) {
      fetchQRConfig();
    }
  }, [agent?.agentId]);

  const fetchQRConfig = async () => {
    try {
      const token = localStorage.getItem('agent_token');
      const res = await fetch(`${baseUrl}/agent-dashboard/qr-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDisplayMode(data.data.displayMode || "all");
        setSelectedServices(data.data.services || ["HOTEL", "RENTAL", "ACTIVITY"]);
        setSelectedItems(data.data.selectedItems || []);
      }
    } catch (error) {
      console.error('Failed to fetch QR config:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const saveQRConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('agent_token');
      const res = await fetch(`${baseUrl}/agent-dashboard/qr-config`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          displayMode,
          services: selectedServices,
          selectedItems
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('QR configuration saved!');
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const fetchAvailableItems = async (serviceType = "", search = "") => {
    setItemsLoading(true);
    try {
      const token = localStorage.getItem('agent_token');
      const params = new URLSearchParams();
      if (serviceType) params.set('serviceType', serviceType);
      if (search) params.set('search', search);
      
      const res = await fetch(`${baseUrl}/agent-dashboard/qr-config/available-items?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAvailableItems(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const toggleService = (service) => {
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        return prev.filter(s => s !== service);
      }
      return [...prev, service];
    });
  };

  const addItem = (item) => {
    const exists = selectedItems.some(si => si.itemId === item.itemId && si.serviceType === item.serviceType);
    if (!exists) {
      setSelectedItems(prev => [...prev, item]);
      toast.success(`Added ${item.itemName}`);
    }
  };

  const removeItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `yatrimap-qr-${agent?.agentId}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  const serviceIcons = {
    HOTEL: <Hotel className="w-5 h-5" />,
    RENTAL: <Car className="w-5 h-5" />,
    ACTIVITY: <Target className="w-5 h-5" />
  };

  const serviceLabels = {
    HOTEL: "Hotels",
    RENTAL: "Rentals",
    ACTIVITY: "Activities"
  };

  const serviceColors = {
    HOTEL: "from-blue-500 to-indigo-600",
    RENTAL: "from-green-500 to-emerald-600",
    ACTIVITY: "from-orange-500 to-amber-600"
  };

  return (
    <div className="space-y-8 pt-16 lg:pt-0 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
          Your QR Code <span className="text-orange-600">Scanner</span>
        </h1>
        <p className="text-xl text-slate-500">
          Share this QR code with customers. When they scan and book, you earn 5% commission!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Display */}
        <Card className="border-0 shadow-2xl bg-white overflow-hidden">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Scan & Book</h2>
            <p className="text-white/80">Get best prices on Activities, Hotels & Rentals</p>
          </div>
          <CardContent className="p-8 flex flex-col items-center">
            <div 
              ref={qrRef}
              className="p-6 bg-white rounded-3xl shadow-inner border-4 border-orange-100 mb-6"
            >
              <QRCodeSVG
                value={referralLink}
                size={280}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/logo.png",
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-slate-900">{agent?.fullName}</p>
              <p className="text-lg text-slate-500">Agent ID: {agent?.agentId}</p>
              <Badge className="bg-green-100 text-green-700 text-lg px-4 py-1">
                5% Commission on every booking
              </Badge>
              {displayMode === "selected" && selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {selectedServices.map(s => (
                    <Badge key={s} className="bg-blue-50 text-blue-700 text-xs">
                      {serviceLabels[s]}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-500" />
                Share Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button 
                  onClick={handleDownload}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download QR
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-14 px-6 text-lg border-2 rounded-xl"
                >
                  <Printer className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative">
                <Input 
                  value={referralLink}
                  readOnly
                  className="h-14 pr-24 text-sm bg-slate-50 border-2"
                />
                <Button 
                  onClick={handleCopy}
                  variant={copied ? "default" : "secondary"}
                  className="absolute right-2 top-2 h-10"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 text-lg border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Book with YatriMap',
                      text: `Book activities, hotels & rentals with me on YatriMap!`,
                      url: referralLink,
                    });
                  }
                }}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share via WhatsApp/SMS
              </Button>
            </CardContent>
          </Card>

          {/* QR Customization */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between"
              >
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  QR Customization
                </CardTitle>
                {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-6">
                {/* Display Mode */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">What should your QR show?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDisplayMode("all")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        displayMode === "all" 
                          ? "border-orange-500 bg-orange-50" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-bold text-slate-900">Show All</p>
                      <p className="text-sm text-slate-500">All services on YatriMap</p>
                    </button>
                    <button
                      onClick={() => {
                        setDisplayMode("selected");
                        if (availableItems.length === 0) fetchAvailableItems();
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        displayMode === "selected" 
                          ? "border-orange-500 bg-orange-50" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-bold text-slate-900">Custom Selection</p>
                      <p className="text-sm text-slate-500">Choose specific services</p>
                    </button>
                  </div>
                </div>

                {displayMode === "selected" && (
                  <>
                    {/* Service Type Selection */}
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-3">Select service types</p>
                      <div className="flex gap-3">
                        {["HOTEL", "RENTAL", "ACTIVITY"].map(service => (
                          <button
                            key={service}
                            onClick={() => toggleService(service)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                              selectedServices.includes(service)
                                ? `border-orange-500 bg-gradient-to-r ${serviceColors[service]} text-white`
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {serviceIcons[service]}
                            <span className="font-semibold text-sm">{serviceLabels[service]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Items */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-slate-700">
                          Specific items ({selectedItems.length})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowItemPicker(true);
                            fetchAvailableItems(filterServiceType, searchQuery);
                          }}
                          className="text-orange-600 border-orange-300"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Items
                        </Button>
                      </div>

                      {selectedItems.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${serviceColors[item.serviceType]} text-white`}>
                                  {serviceIcons[item.serviceType]}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-slate-900">{item.itemName}</p>
                                  <p className="text-xs text-slate-500">{serviceLabels[item.serviceType]} {item.city ? `• ${item.city}` : ''}</p>
                                </div>
                              </div>
                              <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-4">
                          No specific items selected. Your QR will show all items of selected service types.
                        </p>
                      )}
                    </div>

                    {/* Item Picker Modal */}
                    {showItemPicker && (
                      <div className="border-2 border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">Select Items</p>
                          <button onClick={() => setShowItemPicker(false)}>
                            <X className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && fetchAvailableItems(filterServiceType, searchQuery)}
                              className="pl-9 h-10"
                            />
                          </div>
                          <select
                            value={filterServiceType}
                            onChange={(e) => {
                              setFilterServiceType(e.target.value);
                              fetchAvailableItems(e.target.value, searchQuery);
                            }}
                            className="h-10 px-3 rounded-lg border border-slate-200 text-sm"
                          >
                            <option value="">All Types</option>
                            <option value="HOTEL">Hotels</option>
                            <option value="RENTAL">Rentals</option>
                            <option value="ACTIVITY">Activities</option>
                          </select>
                          <Button size="sm" onClick={() => fetchAvailableItems(filterServiceType, searchQuery)} className="h-10 bg-orange-500">
                            <Search className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {itemsLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                            </div>
                          ) : availableItems.length > 0 ? (
                            availableItems.map((item, idx) => {
                              const isSelected = selectedItems.some(si => si.itemId === item.itemId);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => !isSelected && addItem(item)}
                                  disabled={isSelected}
                                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                                    isSelected ? "bg-green-50 border border-green-200" : "bg-white hover:bg-orange-50 border border-slate-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${serviceColors[item.serviceType]} text-white text-xs`}>
                                      {serviceIcons[item.serviceType]}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">{item.itemName}</p>
                                      <p className="text-xs text-slate-500">{serviceLabels[item.serviceType]} {item.city ? `• ${item.city}` : ''}</p>
                                    </div>
                                  </div>
                                  {isSelected ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Plus className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-center text-slate-400 py-8">No items found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Save Button */}
                <Button
                  onClick={saveQRConfig}
                  disabled={saving}
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Save QR Configuration"
                  )}
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Tips Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-blue-900 mb-2">💡 Pro Tips</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  Print and laminate your QR for shops
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  Share on WhatsApp status/stories
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  Use "Custom Selection" to show specific hotels or activities
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  Auto & Taxi drivers get 50+ scans/day!
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}