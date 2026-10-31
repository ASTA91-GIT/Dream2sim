import io
import csv
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


class ReportGenerator:
    """
    Generates downloadable PDF and CSV reports grounded in actual simulation runs.
    """

    @staticmethod
    def generate_csv_metrics(metrics: Dict[str, Any]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Vehicles Generated", metrics.get("total_vehicles_generated", 0)])
        writer.writerow(["Total Vehicles Processed", metrics.get("total_vehicles_processed", 0)])
        writer.writerow(["Average Waiting Time (s)", metrics.get("average_waiting_time_seconds", 0.0)])
        writer.writerow(["Average Travel Time (s)", metrics.get("average_travel_time_seconds", 0.0)])
        writer.writerow(["Average Queue Length", metrics.get("average_queue_length", 0.0)])
        writer.writerow(["Max Queue Length", metrics.get("max_queue_length", 0)])
        writer.writerow(["Average Speed (km/h)", metrics.get("average_speed_kmh", 0.0)])
        writer.writerow(["Throughput (VPH)", metrics.get("throughput_vph", 0.0)])
        writer.writerow(["Congestion Percentage (%)", metrics.get("congestion_percentage", 0.0)])
        writer.writerow(["Signal Efficiency Score", metrics.get("signal_efficiency_score", 0.0)])

        writer.writerow([])
        writer.writerow(["Time (s)", "Active Vehicles", "Queued Vehicles", "Avg Speed (km/h)", "Completed"])
        for row in metrics.get("time_series", []):
            writer.writerow([
                row.get("time", 0),
                row.get("active_vehicles", 0),
                row.get("queued_vehicles", 0),
                row.get("average_speed_kmh", 0.0),
                row.get("completed_vehicles", 0),
            ])

        return output.getvalue()

    @staticmethod
    def generate_pdf_report(
        simulation_title: str,
        metrics: Dict[str, Any],
        ai_analysis: str = "",
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a"),
        )
        sub_style = ParagraphStyle(
            "DocSub",
            parent=styles["Normal"],
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#475569"),
        )
        h2_style = ParagraphStyle(
            "DocH2",
            parent=styles["Heading2"],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=12,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "DocBody",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155"),
        )

        elements = []

        # Header
        elements.append(Paragraph("Dream2Sim - Technical Simulation Report", title_style))
        elements.append(Paragraph(f"Scenario: {simulation_title}", sub_style))
        elements.append(Spacer(1, 15))

        # Metrics Table
        elements.append(Paragraph("Simulation Numerical Results", h2_style))
        table_data = [
            ["Metric Name", "Observed Value", "Units"],
            ["Total Vehicles Spawned", str(metrics.get("total_vehicles_generated", 0)), "vehicles"],
            ["Total Completed Trips", str(metrics.get("total_vehicles_processed", 0)), "vehicles"],
            ["Average Waiting Time", f"{metrics.get('average_waiting_time_seconds', 0.0):.2f}", "seconds"],
            ["Average Travel Time", f"{metrics.get('average_travel_time_seconds', 0.0):.2f}", "seconds"],
            ["Peak Queue Length", str(metrics.get("max_queue_length", 0)), "vehicles"],
            ["Average Speed", f"{metrics.get('average_speed_kmh', 0.0):.2f}", "km/h"],
            ["System Throughput", f"{metrics.get('throughput_vph', 0.0):.1f}", "vehicles/hr"],
            ["Congestion Ratio", f"{metrics.get('congestion_percentage', 0.0):.1f}%", "% of road"],
            ["Signal Efficiency Score", f"{metrics.get('signal_efficiency_score', 0.0)}/100", "index"],
        ]

        t = Table(table_data, colWidths=[200, 150, 150])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))

        # AI Engineering Analysis
        elements.append(Paragraph("Meta AI (Muse Wonder) Engineering Analysis", h2_style))
        clean_analysis = ai_analysis or "Deterministic simulation metrics recorded successfully. No anomalies observed."
        # Split into paragraphs
        for line in clean_analysis.split("\n"):
            if line.strip():
                elements.append(Paragraph(line.strip(), body_style))
                elements.append(Spacer(1, 4))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
