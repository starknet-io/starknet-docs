from settings import *

SIZE = 4

class Video(Scene):
    def construct(self):
        configure(self)

        self.add(grid)
        self.add(grid.get_axis_labels().set_color(COLOR_AXIS_LABELS))
        self.add(unit_circle)

        space =  FULL/SIZE

        angles = [0.0]

        while len(angles) < SIZE:
            angles.append(angles[-1] + space)

        delta = ValueTracker(0)

        def new_dot(angle, color, z=0):
            dot = Dot(angle_to_coords(angle), color=color)
            dot.set_z_index(z)
            return dot

        def line_between(angle1, angle2, color, z=0):
            line = Line(angle_to_coords(angle1), angle_to_coords(angle2), color=color)
            line.set_z_index(z)
            return line

        angle_pairs = [(angles[i], angles[i+1]) for i in range(len(angles)-1)]
        angle_pairs.append((angles[-1], angles[0]))

        dots_plus = [auto(
            lambda angle=angle:
                new_dot(
                    angle + delta.get_value(),
                    color=RED,
                    z=2
                )
            ) for angle in angles]
        dots_minus = [auto(
            lambda angle=angle:
                new_dot(
                    angle - delta.get_value(),
                    color=COLOR_GROUP
                )
            ) for angle in angles]

        lines_plus = [auto(
            lambda angle1=angle1, angle2=angle2:
                line_between(
                    angle1 + delta.get_value(),
                    angle2 + delta.get_value(),
                    RED,
                    z=2
                )
            ) for angle1, angle2 in angle_pairs
        ]

        lines_minus = [auto(
            lambda angle1=angle1, angle2=angle2:
                line_between(
                    angle1 - delta.get_value(),
                    angle2 - delta.get_value(),
                    COLOR_GROUP
                )
            ) for angle1, angle2 in angle_pairs
        ]

        for dot in dots_plus:
            self.play(
                Create(dot),
                run_time=0.4
            )

        self.play(
            *[Create(line) for line in lines_plus],
        )

        self.wait(4)

        rad_line = auto(lambda: radian_line(delta.get_value()))

        self.play(
            Create(rad_line)
        )

        self.wait()

        for dot in dots_minus:
            self.add(dot)

        for line in lines_minus:
            self.add(line)

        pairs = []
        for dot_a in dots_plus:
            x_a, y_a = grid.point_to_coords(dot_a.get_center())
            for dot_b in dots_minus:
                x_b, y_b = grid.point_to_coords(dot_b.get_center())
                if abs(y_a + y_b) > VERY_SMALL:
                    continue
                if abs(x_a - x_b) > VERY_SMALL:
                    continue
                pairs.append((dot_a, dot_b))

        assert len(pairs) == SIZE

        def new_line(pair):
            dot_a, dot_b = pair
            return DashedLine(
                start=dot_a,
                end=dot_b,
                color=COLOR_INV_LINE
            )

        lines = [
            auto(lambda p=p: new_line(p)) for p in pairs
        ]

        self.add(*lines)

        pos = PI / (1.8 * SIZE)

        self.play(
            delta.animate.set_value(pos),
            run_time=4,
        )

        self.play(
            delta.animate.set_value(-pos),
            run_time=4,
        )

        self.play(
            delta.animate.set_value(0),
            run_time=4,
        )

        self.wait()

        self.play(
            *[Uncreate(l) for l in lines],
            run_time=2,
        )

        self.play(
            *[Uncreate(x) for x in dots_plus + lines_plus + dots_minus + lines_minus],
            run_time=2,
        )
