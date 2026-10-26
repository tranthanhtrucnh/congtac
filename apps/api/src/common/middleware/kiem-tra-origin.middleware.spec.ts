import type { Request, Response, NextFunction } from "express";
import {
  kiemTraOrigin,
  laHostNoiBo,
  laOriginHopLe,
} from "./kiem-tra-origin.middleware";

describe("kiem-tra-origin.middleware", () => {
  describe("laHostNoiBo", () => {
    it("cho phep localhost va cac dia chi loopback", () => {
      expect(laHostNoiBo("localhost")).toBe(true);
      expect(laHostNoiBo("127.0.0.1")).toBe(true);
      expect(laHostNoiBo("::1")).toBe(true);
      expect(laHostNoiBo("[::1]")).toBe(true);
    });

    it("cho phep ten may cuc bo khong co dau cham (NetBIOS)", () => {
      expect(laHostNoiBo("mydell")).toBe(true);
      expect(laHostNoiBo("desktop-abc")).toBe(true);
      expect(laHostNoiBo("vanthu")).toBe(true);
    });

    it("cho phep mDNS va mesh Tailscale", () => {
      expect(laHostNoiBo("may-chu.local")).toBe(true);
      expect(laHostNoiBo("mydell.tail32ebe1.ts.net")).toBe(true);
      expect(laHostNoiBo("any-node.ts.net")).toBe(true);
    });

    it("cho phep cac dai IPv4 private", () => {
      // 192.168.x.x
      expect(laHostNoiBo("192.168.1.1")).toBe(true);
      expect(laHostNoiBo("192.168.2.82")).toBe(true);
      expect(laHostNoiBo("192.168.255.254")).toBe(true);

      // 10.x.x.x
      expect(laHostNoiBo("10.0.0.1")).toBe(true);
      expect(laHostNoiBo("10.10.20.30")).toBe(true);

      // 172.16.x.x - 172.31.x.x
      expect(laHostNoiBo("172.16.0.1")).toBe(true);
      expect(laHostNoiBo("172.22.80.1")).toBe(true);
      expect(laHostNoiBo("172.31.255.255")).toBe(true);

      // Tailscale IP (100.64.0.0/10)
      expect(laHostNoiBo("100.114.207.88")).toBe(true);
      expect(laHostNoiBo("100.64.0.1")).toBe(true);
      expect(laHostNoiBo("100.127.255.255")).toBe(true);
      expect(laHostNoiBo("100.128.0.1")).toBe(false);
    });

    it("tu choi IP ngoai pham vi private hoac ten mien la", () => {
      expect(laHostNoiBo("172.15.0.1")).toBe(false);
      expect(laHostNoiBo("172.32.0.1")).toBe(false);
      expect(laHostNoiBo("8.8.8.8")).toBe(false);
      expect(laHostNoiBo("1.1.1.1")).toBe(false);
      expect(laHostNoiBo("google.com")).toBe(false);
      expect(laHostNoiBo("evil-site.org")).toBe(false);
      expect(laHostNoiBo("192.168.1.1.evil.com")).toBe(false);
    });
  });

  describe("laOriginHopLe", () => {
    const dsChoPhep = [
      "http://localhost:3000",
      "https://congty.vn",
    ];

    it("cho phep origin co trong danh sach cau hinh", () => {
      expect(laOriginHopLe("https://congty.vn", dsChoPhep)).toBe(true);
      expect(laOriginHopLe("http://localhost:3000", dsChoPhep)).toBe(true);
    });

    it("cho phep origin tu mang LAN du khong co trong danh sach", () => {
      expect(laOriginHopLe("http://192.168.2.82:3000", dsChoPhep)).toBe(true);
      expect(laOriginHopLe("http://10.0.0.5:3000", dsChoPhep)).toBe(true);
      expect(laOriginHopLe("http://mydell:3000", dsChoPhep)).toBe(true);
      expect(laOriginHopLe("https://mydell.tail32ebe1.ts.net", dsChoPhep)).toBe(true);
    });

    it("tu choi origin la khong nam trong mang noi bo", () => {
      expect(laOriginHopLe("http://evil.com", dsChoPhep)).toBe(false);
      expect(laOriginHopLe("http://123.45.67.89:3000", dsChoPhep)).toBe(false);
    });
  });

  describe("kiemTraOrigin middleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: jest.Mock;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      mockRes = {
        status: statusMock,
      };
      next = jest.fn();
    });

    it("cho qua cac request GET du origin khong hop le", () => {
      mockReq = {
        method: "GET",
        headers: { origin: "http://evil.com" },
      };
      const middleware = kiemTraOrigin(["http://localhost:3000"]);
      middleware(mockReq as Request, mockRes as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("cho qua request POST tu IP mang LAN (vi du: 192.168.2.82:3000)", () => {
      mockReq = {
        method: "POST",
        headers: { origin: "http://192.168.2.82:3000" },
      };
      const middleware = kiemTraOrigin(["http://localhost:3000"]);
      middleware(mockReq as Request, mockRes as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("chan request POST tu origin ben ngoai khong duoc phep (tra ve 403)", () => {
      mockReq = {
        method: "POST",
        headers: { origin: "http://attacker.com" },
      };
      const middleware = kiemTraOrigin(["http://localhost:3000"]);
      middleware(mockReq as Request, mockRes as Response, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Yêu cầu bị từ chối (Origin không hợp lệ)",
      });
    });
  });
});
